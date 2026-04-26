import { NextRequest, NextResponse } from "next/server";

/**
 * Mobile Agent Receiver Endpoint
 * ------------------------------
 * POST /api/update-nodes  → Receives scanned nodes from Termux mobile
 * GET  /api/update-nodes  → Returns stored nodes to the frontend
 *
 * This bridges the mobile scanner (Termux) with the live website on Render.
 */

interface MobileNode {
  ip: string;
  mac?: string;
  name?: string;
  type?: string;
  status?: string;
  response_time?: number;
  city?: string;
  port?: number;
  service?: string;
}

interface StoredScan {
  nodes: MobileNode[];
  receivedAt: string;
  source: string;
  scanMethod: string;
  publicIP?: string;
}

// In-memory store (resets on server restart - use Redis/Firebase for persistence)
let storedScan: StoredScan | null = null;
let lastUpdated = 0;

// Allow CORS for mobile requests
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/**
 * POST /api/update-nodes
 * Body: { nodes: [...], source: "Termux-nmap", scanMethod: "nmap-sT", publicIP: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      nodes?: MobileNode[];
      source?: string;
      scanMethod?: string;
      publicIP?: string;
    };

    if (!body.nodes || !Array.isArray(body.nodes)) {
      return NextResponse.json(
        { success: false, error: "Missing 'nodes' array in request body" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Store the scan
    storedScan = {
      nodes: body.nodes,
      receivedAt: new Date().toISOString(),
      source: body.source || "Unknown Mobile Agent",
      scanMethod: body.scanMethod || "unknown",
      publicIP: body.publicIP || "unknown",
    };
    lastUpdated = Date.now();

    console.log(
      `[MOBILE-AGENT] Received ${body.nodes.length} nodes from ${storedScan.source} at ${storedScan.receivedAt}`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Stored ${body.nodes.length} nodes from ${storedScan.source}`,
        receivedAt: storedScan.receivedAt,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Invalid JSON";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 400, headers: corsHeaders() }
    );
  }
}

/**
 * GET /api/update-nodes
 * Returns the last stored scan data (or mock data if none received yet)
 */
export async function GET(_req: NextRequest) {
  // If we have stored data from mobile, return it
  if (storedScan && lastUpdated > 0) {
    const ageSeconds = Math.floor((Date.now() - lastUpdated) / 1000);
    return NextResponse.json(
      {
        success: true,
        source: storedScan.source,
        scanMethod: storedScan.scanMethod,
        receivedAt: storedScan.receivedAt,
        ageSeconds,
        fromMobile: true,
        public_ip: storedScan.publicIP,
        count: storedScan.nodes.length,
        timestamp: Date.now() / 1000,
        nodes: storedScan.nodes,
      },
      { headers: corsHeaders() }
    );
  }

  // Fallback: return mock data so the UI is never empty
  return NextResponse.json(
    {
      success: true,
      source: "Server Mock (No Mobile Connected)",
      scanMethod: "mock",
      receivedAt: new Date().toISOString(),
      ageSeconds: 0,
      fromMobile: false,
      public_ip: "37.239.231.26",
      count: 10,
      timestamp: Date.now() / 1000,
      nodes: [
        { ip: "192.168.1.1", mac: "aa:bb:cc:dd:ee:01", name: "Gateway", type: "Router", status: "Online", response_time: 1, city: "Wasit-Local" },
        { ip: "192.168.1.105", mac: "aa:bb:cc:dd:ee:02", name: "MacBook-Pro", type: "Monitor", status: "Online", response_time: 12, city: "Wasit-Local" },
        { ip: "192.168.1.144", mac: "aa:bb:cc:dd:ee:03", name: "Smart-Speaker", type: "Speaker", status: "Online", response_time: 7, city: "Wasit-Local" },
        { ip: "192.168.1.10", mac: "aa:bb:cc:dd:ee:04", name: "Workstation-A", type: "Monitor", status: "Online", response_time: 14, city: "Wasit-Local" },
        { ip: "192.168.1.60", mac: "aa:bb:cc:dd:ee:05", name: "Mobile-Android", type: "Smartphone", status: "Online", response_time: 15, city: "Wasit-Local" },
        { ip: "192.168.1.72", mac: "aa:bb:cc:dd:ee:06", name: "iPhone-13", type: "Smartphone", status: "Online", response_time: 18, city: "Wasit-Local" },
        { ip: "192.168.1.90", mac: "aa:bb:cc:dd:ee:07", name: "Raspberry-Pi", type: "Server", status: "Online", response_time: 30, city: "Wasit-Local" },
        { ip: "192.168.1.128", mac: "aa:bb:cc:dd:ee:08", name: "Linux-Server", type: "Server", status: "Online", response_time: 25, city: "Wasit-Local" },
        { ip: "192.168.1.55", mac: "aa:bb:cc:dd:ee:09", name: "Printer", type: "Printer", status: "Offline", response_time: -1, city: "Wasit-Local" },
        { ip: "192.168.1.200", mac: "aa:bb:cc:dd:ee:0a", name: "NAS-Storage", type: "Server", status: "Online", response_time: 45, city: "Wasit-Local" },
      ],
    },
    { headers: corsHeaders() }
  );
}

