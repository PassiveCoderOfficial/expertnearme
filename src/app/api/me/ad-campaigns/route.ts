import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expert = await prisma.expert.findFirst({ where: { email: session.email } });
  if (!expert) {
    return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
  }

  const campaigns = await prisma.adCampaign.findMany({
    where: { expertId: expert.id },
    orderBy: { createdAt: "desc" },
    include: { placement: { select: { spot: true, label: true } } },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expert = await prisma.expert.findFirst({ where: { email: session.email } });
  if (!expert) {
    return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const { placementId, billingCycle, startsAt, targetCountry, targetCategory, bannerImageUrl, bannerLinkUrl, bannerAltText } = body;

  if (!placementId || !billingCycle || !startsAt) {
    return NextResponse.json({ error: "placementId, billingCycle, and startsAt required" }, { status: 400 });
  }
  if (!["WEEKLY", "MONTHLY"].includes(billingCycle)) {
    return NextResponse.json({ error: "billingCycle must be WEEKLY or MONTHLY" }, { status: 400 });
  }

  const placement = await prisma.adPlacement.findUnique({ where: { id: Number(placementId) } });
  if (!placement || !placement.active) {
    return NextResponse.json({ error: "Ad spot not available" }, { status: 400 });
  }

  // Check slot capacity
  const activeCount = await prisma.adCampaign.count({
    where: { placementId: placement.id, status: { in: ["ACTIVE", "PENDING"] } },
  });
  if (placement.maxSlots > 0 && activeCount >= placement.maxSlots) {
    return NextResponse.json({ error: "This spot is fully booked" }, { status: 409 });
  }

  const start = new Date(startsAt);
  const endsAt = new Date(start);
  endsAt.setDate(endsAt.getDate() + (billingCycle === "WEEKLY" ? 7 : 30));
  const amountPaid = billingCycle === "WEEKLY" ? placement.weeklyPrice : placement.monthlyPrice;

  const campaign = await prisma.adCampaign.create({
    data: {
      expertId: expert.id,
      placementId: placement.id,
      billingCycle,
      status: placement.requiresApproval ? "PENDING" : "ACTIVE",
      startsAt: start,
      endsAt,
      amountPaid,
      currency: "USD",
      bannerImageUrl: bannerImageUrl || null,
      bannerLinkUrl: bannerLinkUrl || null,
      bannerAltText: bannerAltText || null,
      targetCountry: targetCountry || null,
      targetCategory: targetCategory || null,
    },
    include: { placement: { select: { spot: true, label: true } } },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const expert = await prisma.expert.findFirst({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const campaign = await prisma.adCampaign.findFirst({ where: { id, expertId: expert.id } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (!["PENDING", "PAUSED"].includes(campaign.status)) {
    return NextResponse.json({ error: "Only PENDING or PAUSED campaigns can be cancelled" }, { status: 400 });
  }

  await prisma.adCampaign.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
