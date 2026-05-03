import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

const SEED_DATA = [
  {
    spot: "BANNER_TOP" as const,
    label: "Sitewide Top Banner",
    weeklyPrice: 750,
    monthlyPrice: 2000,
    maxSlots: 1,
    requiresApproval: true,
  },
  {
    spot: "SEARCH_SPONSOR" as const,
    label: "Search Sponsored Result",
    weeklyPrice: 70,
    monthlyPrice: 200,
    maxSlots: 5,
    requiresApproval: false,
  },
  {
    spot: "HOME_FEATURED" as const,
    label: "Homepage Featured Experts",
    weeklyPrice: 50,
    monthlyPrice: 150,
    maxSlots: 10,
    requiresApproval: false,
  },
  {
    spot: "COUNTRY_FEATURED" as const,
    label: "Country Homepage Featured",
    weeklyPrice: 30,
    monthlyPrice: 90,
    maxSlots: 8,
    requiresApproval: false,
  },
  {
    spot: "CATEGORY_FEATURED" as const,
    label: "Category Listing Featured",
    weeklyPrice: 20,
    monthlyPrice: 60,
    maxSlots: 10,
    requiresApproval: false,
  },
  {
    spot: "PROFILE_SIDEBAR" as const,
    label: "Expert Profile Sidebar",
    weeklyPrice: 10,
    monthlyPrice: 40,
    maxSlots: 5,
    requiresApproval: false,
  },
  {
    spot: "MAP_FEATURED" as const,
    label: "Map Highlighted Pin",
    weeklyPrice: 20,
    monthlyPrice: 60,
    maxSlots: 8,
    requiresApproval: false,
  },
] as const;

async function seedPlacements() {
  for (const seed of SEED_DATA) {
    await prisma.adPlacement.upsert({
      where: { spot: seed.spot },
      update: {},
      create: {
        spot: seed.spot,
        label: seed.label,
        weeklyPrice: seed.weeklyPrice,
        monthlyPrice: seed.monthlyPrice,
        maxSlots: seed.maxSlots,
        requiresApproval: seed.requiresApproval,
        active: true,
      },
    });
  }
}

export async function GET() {
  try {
    await seedPlacements();

    const placements = await prisma.adPlacement.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: {
            campaigns: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    return NextResponse.json({ placements });
  } catch (err) {
    console.error("GET /api/admin/ad-placements error:", err);
    return NextResponse.json({ error: "Failed to fetch placements" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { spot, weeklyPrice, monthlyPrice, maxSlots, active, description } = body;

    if (!spot) {
      return NextResponse.json({ error: "spot is required" }, { status: 400 });
    }

    const placement = await prisma.adPlacement.update({
      where: { spot },
      data: {
        ...(weeklyPrice !== undefined && { weeklyPrice: Number(weeklyPrice) }),
        ...(monthlyPrice !== undefined && { monthlyPrice: Number(monthlyPrice) }),
        ...(maxSlots !== undefined && { maxSlots: Number(maxSlots) }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(description !== undefined && { description: description || null }),
      },
    });

    return NextResponse.json({ placement });
  } catch (err) {
    console.error("PATCH /api/admin/ad-placements error:", err);
    return NextResponse.json({ error: "Failed to update placement" }, { status: 500 });
  }
}
