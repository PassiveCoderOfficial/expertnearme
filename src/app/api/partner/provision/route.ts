import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const PARTNER_SECRET = process.env.PARTNER_SECRET;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!PARTNER_SECRET) return unauthorized();
  if (req.headers.get("x-partner-secret") !== PARTNER_SECRET) return unauthorized();

  let body: { email: string; name?: string; pcTenantId: string; tier: "free" | "pro" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, pcTenantId, tier } = body;
  if (!email || !pcTenantId || !["free", "pro"].includes(tier)) {
    return NextResponse.json({ ok: false, error: "Missing or invalid fields" }, { status: 400 });
  }

  // Find by pcTenantId first (most reliable — survives email changes on PC side)
  let user = await prisma.user.findUnique({ where: { pcTenantId } });

  if (!user) {
    // Try by email — user may have signed up on ENM directly before linking
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (user) {
    // Merge: update pcTenantId + tier
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        pcTenantId,
        pcTier: tier,
        // Sync email if it changed on PC side
        ...(user.email !== email ? { email } : {}),
      },
    });
    return NextResponse.json({ ok: true, userId: user.id, created: false });
  }

  // Create new ENM account with a random password (user will never log in with it directly — SSO only)
  const randomPassword = crypto.randomBytes(24).toString("hex");
  const hashed = await bcrypt.hash(randomPassword, 10);

  user = await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      password: hashed,
      role: "BUYER",
      roles: ["BUYER"],
      activeRole: "BUYER",
      defaultRole: "BUYER",
      verified: true, // pre-verified — PC already verified their email
      pcTenantId,
      pcTier: tier,
    },
  });

  return NextResponse.json({ ok: true, userId: user.id, created: true }, { status: 201 });
}
