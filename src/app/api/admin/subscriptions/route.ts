import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ALLOWED = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_AGENT"]);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status  = searchParams.get("status") || "";
  const gateway = searchParams.get("gateway") || "";
  const page    = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit   = 25;

  const where: Record<string, unknown> = {};
  if (status)  where.status  = status;
  if (gateway) where.gateway = gateway;

  const [rows, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        plan: { select: { id: true, name: true, price: true, currency: true, duration: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.subscription.count({ where }),
  ]);

  return NextResponse.json({ subscriptions: rows, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, planId, cycles = 1, paymentRef, gateway } = await req.json();
  if (!userId || !planId) {
    return NextResponse.json({ error: "userId and planId required" }, { status: 400 });
  }

  const plan = await prisma.pricing.findUnique({ where: { id: Number(planId) } });
  const isLifetime = plan ? plan.duration === 0 : false;
  const endsAt = plan && plan.duration > 0
    ? new Date(Date.now() + plan.duration * Number(cycles) * 24 * 60 * 60 * 1000)
    : null;

  const sub = await prisma.subscription.create({
    data: {
      userId: Number(userId),
      planId: Number(planId),
      isLifetime,
      endsAt,
      paymentRef: paymentRef || null,
      gateway: gateway || null,
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ success: true, subscription: sub }, { status: 201 });
}
