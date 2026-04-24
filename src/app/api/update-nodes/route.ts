import { NextRequest, NextResponse } from 'next/server';

// Global variable to hold data in memory
let scannedNodes: string[] = [];

export async function POST(req: NextRequest) {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const body = await req.json();
    if (body.ips) {
      scannedNodes = body.ips; // Save data from phone
      console.log('📱 Stored nodes:', scannedNodes);
      return NextResponse.json({ success: true }, { headers });
    }
    return NextResponse.json({ success: false }, { status: 400, headers });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false }, { status: 400, headers });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');
  return new NextResponse(null, { status: 200, headers });
}

export async function GET(req: NextRequest) {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  return NextResponse.json({ ips: scannedNodes }, { headers }); // Send data to radar
}
