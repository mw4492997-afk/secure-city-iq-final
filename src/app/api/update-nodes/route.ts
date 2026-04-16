import { NextRequest, NextResponse } from 'next/server';

// Global storage for phone-reported node IPs (persists per Render instance)
let nodeIPs: string[] = [];

export async function POST(request: NextRequest) {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const body = await request.json();
    nodeIPs = body.ips || body || []; // Super simple: accept ips or anything
    console.log(`📱 Phone data:`, nodeIPs);
    return NextResponse.json({ success: true, nodes: nodeIPs }, { headers });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed', received: await request.text() }, { 
      status: 400, 
      headers 
    });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');
  return new NextResponse(null, { status: 200, headers });
}

export async function GET(request: NextRequest) {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  
  const devices = nodeIPs.map(ip => ({
    ip,
    status: 'phone-reported' as const,
    latency: 0,
    lastSeen: new Date().toISOString(),
    mac: 'MOBILE:' + Math.random().toString(16).slice(2, 8).toUpperCase(),
    vendor: 'Phone Reporter'
  }));

  return NextResponse.json({
    devices,
    count: devices.length,
    timestamp: new Date().toISOString()
  }, { headers });
}
