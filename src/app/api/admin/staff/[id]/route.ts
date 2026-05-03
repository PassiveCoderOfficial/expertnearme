import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ADMIN_OK = new Set(["SUPER_ADMIN", "ADMIN"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !ADMIN_OK.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { role, name } = await req.json();

  if (role === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can assign Super Admin role" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (role)  data.role = role;
  if (name)  data.name = name;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !ADMIN_OK.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (Number(id) === session.userId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
