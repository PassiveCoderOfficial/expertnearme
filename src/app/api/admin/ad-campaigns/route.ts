import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const spotFilter = searchParams.get("spot");

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;
  if (spotFilter) {
    where.placement = { spot: spotFilter };
  }

  try {
    const campaigns = await prisma.adCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            profileLink: true,
            profilePicture: true,
          },
        },
        placement: {
          select: {
            id: true,
            spot: true,
            label: true,
          },
        },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("GET /api/admin/ad-campaigns error:", err);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      placementId,
      billingCycle,
      startsAt,
      targetCountry,
      targetCategory,
      bannerImageUrl,
      bannerLinkUrl,
      bannerAltText,
      paymentMethod,
    } = body;

    if (!placementId || !billingCycle || !startsAt) {
      return NextResponse.json(
        { error: "placementId, billingCycle, and startsAt are required" },
        { status: 400 }
      );
    }

    if (!["WEEKLY", "MONTHLY"].includes(billingCycle)) {
      return NextResponse.json({ error: "billingCycle must be WEEKLY or MONTHLY" }, { status: 400 });
    }

    const placement = await prisma.adPlacement.findUnique({
      where: { id: Number(placementId) },
    });
    if (!placement) {
      return NextResponse.json({ error: "Placement not found" }, { status: 404 });
    }
    if (!placement.active) {
      return NextResponse.json({ error: "This ad spot is not currently available" }, { status: 400 });
    }

    const expert = await prisma.expert.findFirst({ where: { email: session.email } });
    if (!expert) {
      return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
    }

    const start = new Date(startsAt);
    const daysToAdd = billingCycle === "WEEKLY" ? 7 : 30;
    const endsAt = new Date(start);
    endsAt.setDate(endsAt.getDate() + daysToAdd);

    const amountPaid = billingCycle === "WEEKLY" ? placement.weeklyPrice : placement.monthlyPrice;
    const status = placement.requiresApproval ? "PENDING" : "ACTIVE";

    const campaign = await prisma.adCampaign.create({
      data: {
        expertId: expert.id,
        placementId: placement.id,
        billingCycle,
        status,
        startsAt: start,
        endsAt,
        amountPaid,
        currency: "USD",
        bannerImageUrl: bannerImageUrl || null,
        bannerLinkUrl: bannerLinkUrl || null,
        bannerAltText: bannerAltText || null,
        targetCountry: targetCountry || null,
        targetCategory: targetCategory || null,
        paymentMethod: paymentMethod || null,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/ad-campaigns error:", err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
