import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const ALLOWED_SIGNUP_ROLES = ["BUYER", "EXPERT", "SALES_AGENT"] as const;
type SignupRole = (typeof ALLOWED_SIGNUP_ROLES)[number];

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing email or password" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const assignedRole: SignupRole =
      role && ALLOWED_SIGNUP_ROLES.includes(role as SignupRole)
        ? (role as SignupRole)
        : "BUYER";

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
        verified: false,
        role: assignedRole,
        roles: [assignedRole],
        activeRole: assignedRole,
        defaultRole: assignedRole,
      },
    });

    const setting = await prisma.setting.findUnique({
      where: { key: "emailVerificationRequired" },
    });
    const emailVerificationRequired =
      setting?.value === "ON" ||
      process.env.EMAIL_VERIFICATION_REQUIRED === "ON";

    if (!emailVerificationRequired) {
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
      });
    }

    return NextResponse.json({ ok: true, emailVerificationRequired });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
