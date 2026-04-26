import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for the external Flask API that returns active network nodes.
 * Set FLASK_API_URL in your environment variables.
 * Example: FLASK_API_URL=http://localhost:5000
 * 
 * If Flask is not available, returns realistic mock data so the UI always works.
 */

function getMockData() {
  return {
    success: true,
    public_ip: "37.239.231.26",
    local_ip: "192.168.1.1",
    network_range: "192.168.1.0/24",
    count: 10,
    timestamp: Date.now() / 1000,
    scan_method: "mock",
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
  };
}

export async function GET(_req: NextRequest) {
  const flaskUrl = process.env.FLASK_API_URL;

  // If no Flask URL is configured, return mock data immediately
  if (!flaskUrl) {
    console.log("[API] No FLASK_API_URL set, returning mock data");
    return NextResponse.json(getMockData());
  }

  // Try to connect to Flask
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${flaskUrl}/api/get_nodes`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`[API] Flask returned ${response.status}, using mock data`);
      return NextResponse.json(getMockData());
    }

    const data = await response.json();
    console.log("[API] Flask data received successfully");
    return NextResponse.json(data);
  } catch (error) {
    console.log("[API] Flask connection failed, using mock data:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(getMockData());
  }
}

