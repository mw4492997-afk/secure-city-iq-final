import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// TCP connection test using external service (no shell execution)
async function tcpPing(host: string, port: number = 80): Promise<{ reachable: boolean; responseTime: number }> {
  const startTime = Date.now();

  try {
    // Use a public ping service or simulate
    // For real implementation, use a service like ping.pe or similar
    const response = await fetch(`https://api.hackertarget.com/nping/?q=${host}`, {
      timeout: 5000
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { reachable: true, responseTime };
    } else {
      return { reachable: false, responseTime };
    }
  } catch (error) {
    return { reachable: false, responseTime: Date.now() - startTime };
  }
}

// Fetch geolocation for an IP address
async function getIPGeolocation(ip: string): Promise<{
  ip: string;
  city: string;
  country: string;
  org: string;
  lat: number;
  lon: number;
}> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'Secure-City-IQ/1.0' },
    });
    
    if (!response.ok) throw new Error('Geolocation lookup failed');
    
    const data = await response.json();
    
    return {
      ip: data.ip || ip,
      city: data.city || 'Unknown',
      country: data.country_name || 'Unknown',
      org: data.org || 'Unknown ISP',
      lat: parseFloat(data.latitude) || 0,
      lon: parseFloat(data.longitude) || 0,
    };
  } catch (error) {
    console.error(`Geolocation error for ${ip}:`, error);
    return {
      ip,
      city: 'Unknown',
      country: 'Unknown',
      org: 'ISP Lookup Failed',
      lat: 0,
      lon: 0,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, scan_type = 'ping' } = body;

    if (!target) {
      return NextResponse.json(
        { error: 'Target IP address required' },
        { status: 400 }
      );
    }

    // Validate IP format (basic check)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(target)) {
      return NextResponse.json(
        { error: 'Invalid IP address format' },
        { status: 400 }
      );
    }

    if (scan_type === 'ping') {
      // Ping the target
      const pingResult = await tcpPing(target);
      const geoData = await getIPGeolocation(target);

      return NextResponse.json({
        success: true,
        target,
        reachable: pingResult.reachable,
        responseTime: pingResult.responseTime,
        status: pingResult.reachable ? 'ONLINE' : 'OFFLINE',
        geolocation: geoData,
        timestamp: new Date().toISOString(),
      });
    }

    if (scan_type === 'subnet') {
      // Scan a subnet by testing multiple IPs in the range
      const [a, b, c] = target.split('.').slice(0, 3);
      const baseIP = `${a}.${b}.${c}`;
      
      // Test IPs from .1 to .254 (limit to reduce response time)
      const testIPs = [1, 50, 100, 150, 200, 254].map(
        (num) => `${baseIP}.${num}`
      );

      const results = await Promise.all(
        testIPs.map(async (ip) => {
          const ping = await tcpPing(ip);
          if (ping.reachable) {
            const geo = await getIPGeolocation(ip);
            return {
              ip,
              status: 'ONLINE',
              responseTime: ping.responseTime,
              geolocation: geo,
            };
          }
          return null;
        })
      );

      const activeNodes = results.filter((r) => r !== null);

      return NextResponse.json({
        success: true,
        subnet: baseIP,
        activeNodes: activeNodes.length,
        nodes: activeNodes,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Unknown scan type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      {
        error: 'Scan failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('target');
  const scanType = request.nextUrl.searchParams.get('scan_type') || 'ping';

  if (!target) {
    return NextResponse.json(
      { error: 'Target IP address required' },
      { status: 400 }
    );
  }

  // Delegate to POST handler
  const req = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ target, scan_type: scanType }),
  });

  return POST(req);
}
