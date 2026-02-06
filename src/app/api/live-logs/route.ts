import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get live logs from global store
    const liveLogs = (globalThis as any).liveLogs || [];

    return NextResponse.json({
      logs: liveLogs,
      total: liveLogs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Live logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live logs' },
      { status: 500 }
    );
  }
}
