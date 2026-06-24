import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const PARTNER_SECRET = process.env.PARTNER_SECRET;
const SSO_SECRET = process.env.SSO_SECRET;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!PARTNER_SECRET || !SSO_SECRET) return unauthorized();
  if (req.headers.get("x-partner-secret") !== PARTNER_SECRET) return unauthorized();

  let body: { userId: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { userId } = body;
  if (!userId || typeof userId !== "number") {
    return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  // Sign a short-lived SSO token — type:"sso" distinguishes it from a session token
  // so it cannot be used as a session cookie even if JWT_SECRET === SSO_SECRET (which it shouldn't be)
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.activeRole, type: "sso" },
    SSO_SECRET,
    { expiresIn: "5m" },
  );

  return NextResponse.json({ ok: true, token });
}
