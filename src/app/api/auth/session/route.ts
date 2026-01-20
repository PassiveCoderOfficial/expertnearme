import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("token="));

    if (!match) {
      return NextResponse.json({ ok: false, authenticated: false });
    }

    const token = match.split("=")[1];
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };

    return NextResponse.json({
      ok: true,
      authenticated: true,
      role: payload.role,
      userId: payload.userId,
    });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ ok: false, authenticated: false });
  }
}
