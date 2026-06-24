import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { syncToPC } from "@/lib/pc-sync";

const ALLOWED = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const allowed = ["status", "endsAt", "paymentRef", "gateway", "isLifetime"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = key === "endsAt" && body[key] ? new Date(body[key]) : body[key];
  }

  const sub = await prisma.subscription.update({
    where: { id: Number(id) },
    data,
    include: { user: { select: { email: true, name: true } }, plan: { select: { price: true, duration: true } } },
  });

  // If activating a sub, sync tier to PC
  if (body.status === "ACTIVE" && sub.user && sub.plan) {
    const isPro = sub.plan.price >= 80 && sub.plan.duration !== -1;
    syncToPC({ userId: sub.userId, email: sub.user.email, name: sub.user.name, tier: isPro ? "pro" : "free" })
      .catch(err => console.error("[PC sync] activate subscription", err));
  }

  return NextResponse.json({ success: true, subscription: sub });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.subscription.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
