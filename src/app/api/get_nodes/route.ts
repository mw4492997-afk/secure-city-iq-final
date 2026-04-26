import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for the external Flask API that returns active network nodes.
 * Set FLASK_API_URL in your environment variables.
 * Example: FLASK_API_URL=http://localhost:5000
 */
export async function GET(_req: NextRequest) {
  const flaskUrl = process.env.FLASK_API_URL || "http://localhost:5000";

  // If FLASK_API_URL is not set, we default to localhost:5000 (the local test server).
  // If that is also down, we return a fallback mock response.

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${flaskUrl}/api/get_nodes`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Flask API returned ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 504 }
    );
  }
}

