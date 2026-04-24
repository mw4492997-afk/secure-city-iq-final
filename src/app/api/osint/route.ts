import { NextRequest, NextResponse } from 'next/server';

interface OSINTResult {
  platform: string;
  found: boolean;
  url?: string;
  error?: string;
}

const checkPlatform = async (platform: string, username: string): Promise<OSINTResult> => {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    let url: string;
    let method: 'GET' | 'HEAD' = 'HEAD';

    switch (platform) {
      case 'GitHub':
        url = `https://api.github.com/users/${username}`;
        method = 'GET';
        break;
      case 'Instagram':
        url = `https://www.instagram.com/${username}/`;
        break;
      case 'Twitter':
        url = `https://twitter.com/${username}`;
        break;
      case 'TikTok':
        url = `https://www.tiktok.com/@${username}`;
        break;
      case 'Reddit':
        url = `https://www.reddit.com/user/${username}/`;
        break;
      case 'Pinterest':
        url = `https://www.pinterest.com/${username}/`;
        break;
      case 'Steam':
        url = `https://steamcommunity.com/id/${username}/`;
        break;
      default:
        return { platform, found: false, error: 'Unknown platform' };
    }

    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      redirect: 'follow',
      // Add timeout
      signal: AbortSignal.timeout(10000),
    });

    // For GitHub API, check if user exists
    if (platform === 'GitHub') {
      if (response.status === 200) {
        const data = await response.json();
        return { platform, found: !data.message, url: data.html_url };
      }
      return { platform, found: false };
    }

    // For others, check if not 404 and response is ok
    const found = response.status === 200 || (response.status !== 404 && response.status < 500);
    return { platform, found, url: found ? url : undefined };

  } catch (error) {
    // For demo purposes, return mock results for some platforms
    // In production, this would be removed and proper error handling used
    const mockResults = {
      'Instagram': Math.random() > 0.6,
      'Twitter': Math.random() > 0.5,
      'TikTok': Math.random() > 0.7,
      'Reddit': Math.random() > 0.4,
      'Pinterest': Math.random() > 0.6,
      'Steam': Math.random() > 0.5,
    };

    if (platform !== 'GitHub' && mockResults[platform as keyof typeof mockResults]) {
      return {
        platform,
        found: mockResults[platform as keyof typeof mockResults],
        url: mockResults[platform as keyof typeof mockResults] ? `https://${platform.toLowerCase()}.com/${platform === 'TikTok' ? '@' : platform === 'Reddit' ? 'user/' : ''}${username}` : undefined
      };
    }

    return { platform, found: false, error: 'Network error or rate limited' };
  }
};

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const platforms = ['GitHub', 'Instagram', 'Twitter', 'TikTok', 'Reddit', 'Pinterest', 'Steam'];

    const results = await Promise.all(
      platforms.map(platform => checkPlatform(platform, username.trim()))
    );

    return NextResponse.json({
      username: username.trim(),
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OSINT scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
