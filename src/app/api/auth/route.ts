import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME = process.env.AUTH_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH || "$2b$10$qosvQ0GNe8iDhIGcCxxeSOf14NiZ9XOG/J5LNdYOhkZ3o9Wm.SaMa";
const AUTH_COOKIE_NAME = "secure_city_iq_auth";

function getUnauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  );
}

async function logAuditEvent(event: string, source: string, level: "Info" | "Warning" | "Critical" | "Alert") {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/audit-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, source, level }),
    });
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      await logAuditEvent("Login attempt with missing credentials", "Authentication", "Warning");
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USERNAME) {
      await logAuditEvent(`Failed login attempt for user: ${username}`, "Authentication", "Alert");
      return getUnauthorizedResponse();
    }

    const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!valid) {
      await logAuditEvent(`Failed login attempt for user: ${username}`, "Authentication", "Alert");
      return getUnauthorizedResponse();
    }

    await logAuditEvent(`User login successful: ${username}`, "Authentication", "Info");

    const response = NextResponse.json({ success: true, authenticated: true });
    response.cookies.set(AUTH_COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("Auth login error:", error);
    await logAuditEvent("Authentication service error", "Authentication", "Critical");
    return NextResponse.json(
      { success: false, error: "Authentication service error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const authenticated = token === "1";
    return NextResponse.json({ authenticated });
  } catch (error) {
    console.error("Auth status error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
