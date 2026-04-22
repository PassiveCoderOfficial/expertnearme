import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ALLOWED = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);

export async function GET() {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const plans = await prisma.pricing.findMany({
    orderBy: { price: "asc" },
    include: {
      _count: { select: { subscriptions: true } },
      subscriptions: {
        where: { status: "ACTIVE" },
        select: { id: true, isLifetime: true },
      },
    },
  });

  const [totalActive, totalLifetime, totalRevenue] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", isLifetime: true } }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: { select: { price: true } } },
    }).then((subs) => subs.reduce((sum, s) => sum + (s.isLifetime ? s.plan.price : s.plan.price), 0)),
  ]);

  return NextResponse.json({
    plans: plans.map((p) => ({
      ...p,
      activeCount: p.subscriptions.length,
      totalCount: p._count.subscriptions,
      revenue: p.subscriptions.length * p.price,
    })),
    stats: { totalActive, totalLifetime, totalRevenue },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, description, price, currency, duration, features, active, featured } = await req.json();
  if (!name || price == null || !duration) {
    return NextResponse.json({ error: "name, price, and duration are required" }, { status: 400 });
  }

  const plan = await prisma.pricing.create({
    data: {
      name,
      description: description || null,
      price: Number(price),
      currency: currency || "USD",
      duration: Number(duration),
      features: Array.isArray(features) ? JSON.stringify(features) : (features || "[]"),
      active: active !== false,
      featured: featured === true,
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
