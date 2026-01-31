import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get client IP address from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = request.headers.get('x-client-ip') ||
                     forwarded?.split(',')[0]?.trim() ||
                     realIp ||
                     request.ip ||
                     '127.0.0.1';

    // Fetch geolocation data from ipapi.co (free, no API key required)
    const geoResponse = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'SECURE-CITY-IQ-Scanner/1.0'
      }
    });

    if (!geoResponse.ok) {
      throw new Error('Failed to fetch geolocation data');
    }

    const geoData = await geoResponse.json();

    // Determine network status based on IP type
    let network_status = 'SECURE';
    if (geoData.ip !== clientIp) {
      network_status = 'PROXIED';
    } else if (geoData.country_code) {
      network_status = 'CONNECTED';
    }

    return NextResponse.json({
      ip: geoData.ip || clientIp,
      city: geoData.city || 'Unknown',
      region: geoData.region || 'Unknown',
      country: geoData.country_name || 'Unknown',
      country_code: geoData.country_code || 'Unknown',
      timezone: geoData.timezone || 'Unknown',
      asn: geoData.asn || 'Unknown',
      org: geoData.org || 'Unknown',
      network_status: network_status,
      coordinates: {
        latitude: geoData.latitude,
        longitude: geoData.longitude
      }
    });
  } catch (error) {
    console.error('Net stat error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve network statistics',
      ip: 'Unknown',
      city: 'Unknown',
      country: 'Unknown',
      timezone: 'Unknown',
      network_status: 'ERROR'
    }, { status: 500 });
  }
}
