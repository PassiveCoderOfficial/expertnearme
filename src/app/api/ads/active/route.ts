import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const category = searchParams.get("category");

  const now = new Date();

  try {
    const campaigns = await prisma.adCampaign.findMany({
      where: {
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gte: now },
        AND: [
          country
            ? { OR: [{ targetCountry: null }, { targetCountry: country }] }
            : {},
          category
            ? { OR: [{ targetCategory: null }, { targetCategory: category }] }
            : {},
        ],
      },
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            profileLink: true,
            profilePicture: true,
            categories: {
              select: {
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
        placement: {
          select: { spot: true, label: true },
        },
      },
    });

    const grouped: Record<string, unknown[] | unknown | null> = {
      BANNER_TOP: null,
      SEARCH_SPONSOR: [],
      HOME_FEATURED: [],
      COUNTRY_FEATURED: [],
      CATEGORY_FEATURED: [],
      PROFILE_SIDEBAR: [],
      MAP_FEATURED: [],
    };

    const bySpot: Record<string, typeof campaigns> = {};
    for (const campaign of campaigns) {
      const spot = campaign.placement.spot;
      if (!bySpot[spot]) bySpot[spot] = [];
      bySpot[spot].push(campaign);
    }

    for (const [spot, spotCampaigns] of Object.entries(bySpot)) {
      const shuffled = shuffle(spotCampaigns);

      const toItem = (c: (typeof campaigns)[number]) => ({
        id: c.id,
        expertId: c.expertId,
        expertName: c.expert.name,
        expertSlug: c.expert.profileLink,
        profilePic: c.expert.profilePicture,
        categories: c.expert.categories.map((ec) => ec.category),
        bannerImageUrl: c.bannerImageUrl,
        bannerLinkUrl: c.bannerLinkUrl,
        bannerAltText: c.bannerAltText,
        targetCountry: c.targetCountry,
        targetCategory: c.targetCategory,
        impressions: c.impressions,
        clicks: c.clicks,
      });

      if (spot === "BANNER_TOP") {
        grouped[spot] = shuffled.length > 0 ? toItem(shuffled[0]) : null;
      } else {
        grouped[spot] = shuffled.map(toItem);
      }
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("GET /api/ads/active error:", err);
    return NextResponse.json({ error: "Failed to fetch active ads" }, { status: 500 });
  }
}
