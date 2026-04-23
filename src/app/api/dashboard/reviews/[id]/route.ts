import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.review.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

export async function GET(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}

export async function PATCH(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}
