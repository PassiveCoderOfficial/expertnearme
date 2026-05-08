import { prisma } from "@/lib/db";
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
      return NextResponse.json({ ok: false, authenticated: false }, { status: 200 });
    }

    const token = match.split("=")[1];
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        roles: true,
        activeRole: true,
        defaultRole: true,
        verified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true, authenticated: true, user }, { status: 200 });
  } catch (err) {
    console.error("ME route error:", err);
    return NextResponse.json({ ok: false, authenticated: false }, { status: 200 });
  }
}
