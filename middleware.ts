import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Intrusion detection patterns
const intrusionPatterns = [
  /<script/i,
  /javascript:/i,
  /onload=/i,
  /onerror=/i,
  /eval\(/i,
  /document\.cookie/i,
  /localStorage/i,
  /sessionStorage/i,
  /\.\./, // Directory traversal
  /%2e%2e/i, // URL encoded ..
];

function isIntrusionAttempt(url: string, userAgent: string): boolean {
  const decodedUrl = decodeURIComponent(url);
  return intrusionPatterns.some(pattern =>
    pattern.test(decodedUrl) || pattern.test(userAgent)
  );
}

function getRealIP(request: NextRequest): string {
  // Check various headers for real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  const trueClientIP = request.headers.get('true-client-ip');

  // Return the first available real IP
  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         cfIP ||
         trueClientIP ||
         '127.0.0.1'; // fallback for local development
}

async function getCountryFromIP(ip: string): Promise<string> {
  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Local Network';
  }

  try {
    // Use a free IP geolocation service
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country`, {
      headers: {
        'User-Agent': 'SecureCityIQ-Monitoring/1.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.country || 'Unknown';
    }
  } catch (error) {
    console.error('Geolocation error:', error);
  }

  return 'Unknown';
}

function checkRateLimit(ip: string): { isLimited: boolean; isThreat: boolean } {
  const now = Date.now();
  const windowMs = 10000; // 10 seconds
  const maxRequests = 20;

  const key = ip;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or new entry
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { isLimited: false, isThreat: false };
  }

  current.count++;

  if (current.count > maxRequests) {
    return { isLimited: true, isThreat: true };
  }

  return { isLimited: false, isThreat: false };
}

export async function middleware(request: NextRequest) {
  const url = request.url;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  // Get real IP and country
  const realIP = getRealIP(request);
  const country = await getCountryFromIP(realIP);

  // Check rate limiting
  const rateLimit = checkRateLimit(realIP);

  // Determine action type
  let action = `${method} ${new URL(url).pathname}`;

  // Check for 404 (will be handled by Next.js, but we can detect non-existent routes)
  const pathname = new URL(url).pathname;
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(pathname);

  if (!isApiRoute && !isStaticAsset && pathname !== '/' && !pathname.startsWith('/_next')) {
    // This might be a 404, but we'll let Next.js handle it
    action = `PAGE_ACCESS: ${pathname}`;
  }

  // Check for intrusion attempts
  const isIntrusion = isIntrusionAttempt(url, userAgent);

  // Create log entry
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] [LIVE_REAL_TIME] IP:${realIP} | COUNTRY:${country} | ACTION:${action}`;

  if (rateLimit.isThreat) {
    logEntry += ' | STATUS:DDOS_THREAT';
  } else if (isIntrusion) {
    logEntry += ' | STATUS:INTRUSION_ATTEMPT';
  } else {
    logEntry += ' | STATUS:NORMAL';
  }

  // Store the log entry (in a real app, you'd use a database or external service)
  // For now, we'll use a global variable that can be accessed by the API
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any).liveLogs) {
      (globalThis as any).liveLogs = [];
    }
    (globalThis as any).liveLogs.push(logEntry);

    // Keep only last 100 entries
    if ((globalThis as any).liveLogs.length > 100) {
      (globalThis as any).liveLogs = (globalThis as any).liveLogs.slice(-100);
    }
  }

  // Handle rate limiting
  if (rateLimit.isThreat) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Access temporarily blocked.'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    );
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
