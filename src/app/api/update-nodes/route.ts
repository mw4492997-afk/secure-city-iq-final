import { NextRequest, NextResponse } from 'next/server';

// Global storage for phone-reported node IPs (persists per Render instance)
let nodeIPs: string[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ips } = body;
    
    if (!Array.isArray(ips)) {
      return NextResponse.json({ error: 'ips must be an array of strings' }, { status: 400 });
    }

    nodeIPs = ips.filter(ip => typeof ip === 'string' && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/));
    
    console.log(`📱 Phone updated ${nodeIPs.length} nodes:`, nodeIPs);
    
    return NextResponse.json({
      success: true,
      updated: nodeIPs.length,
      nodes: nodeIPs
    });
  } catch (error) {
    console.error('Update nodes error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
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
  });
}
