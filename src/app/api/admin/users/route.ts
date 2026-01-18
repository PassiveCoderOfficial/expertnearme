// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    // optional query ?q= or pagination later
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, verified: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error("GET /api/admin/users", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!email || !password) return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: false, error: "Email already exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
        role: role || "USER",
        verified: true, // admin-created users are verified by default
      },
    });

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error("POST /api/admin/users", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, email, role, verified } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        role: role ?? undefined,
        verified: typeof verified === "boolean" ? verified : undefined,
      },
      select: { id: true, name: true, email: true, role: true, verified: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    console.error("PUT /api/admin/users", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/users", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
