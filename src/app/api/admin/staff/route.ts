import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const STAFF_ROLES = ["MANAGER", "MARKETER", "SEO_EXPERT", "SALES_AGENT", "ADMIN"];
const SUPER_ONLY  = new Set(["SUPER_ADMIN"]);
const ADMIN_OK    = new Set(["SUPER_ADMIN", "ADMIN"]);

export async function GET() {
  const session = await getSession();
  if (!session || !ADMIN_OK.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER", "MARKETER", "SEO_EXPERT", "SALES_AGENT"] as any } },
    select: { id: true, name: true, email: true, role: true, verified: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !ADMIN_OK.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password, and role required" }, { status: 400 });
  }

  // Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN
  if ((role === "ADMIN" || role === "SUPER_ADMIN") && !SUPER_ONLY.has(session.role)) {
    return NextResponse.json({ error: "Only Super Admin can create Admin accounts" }, { status: 403 });
  }

  if (!STAFF_ROLES.includes(role) && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Invalid staff role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name || email.split("@")[0], email, password: hashed, role, verified: true },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ success: true, user }, { status: 201 });
}
