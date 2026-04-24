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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USERNAME) {
      return getUnauthorizedResponse();
    }

    const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!valid) {
      return getUnauthorizedResponse();
    }

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
