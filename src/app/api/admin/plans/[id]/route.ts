import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ALLOWED = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.duration !== undefined) data.duration = Number(body.duration);
  if (body.features !== undefined) data.features = Array.isArray(body.features) ? JSON.stringify(body.features) : body.features;
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.featured !== undefined) data.featured = Boolean(body.featured);

  const plan = await prisma.pricing.update({ where: { id }, data });
  return NextResponse.json({ plan });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  const subCount = await prisma.subscription.count({ where: { planId: id } });
  if (subCount > 0) {
    return NextResponse.json({ error: "Cannot delete a plan with existing subscriptions" }, { status: 400 });
  }

  await prisma.pricing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
