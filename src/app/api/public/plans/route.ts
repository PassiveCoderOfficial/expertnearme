import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.pricing.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    });
    // Also include inactive plans so the frontend can show "Coming Soon"
    const allPlans = await prisma.pricing.findMany({
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ ok: true, plans: allPlans });
  } catch (err: any) {
    console.error("GET /api/public/plans error:", err?.message);
    return NextResponse.json({ ok: false, plans: [] });
  }
}
