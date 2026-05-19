import { prisma } from "@/lib/db";
import type { StaticFeaturedExpert } from "@/components/ads/AdFeaturedExpertsStatic";

type AdSpotString =
  | "HOME_FEATURED"
  | "COUNTRY_FEATURED"
  | "CATEGORY_FEATURED"
  | "PROFILE_SIDEBAR"
  | "MAP_FEATURED";

export async function fetchFeaturedExperts(
  spot: AdSpotString,
  options: { country?: string; category?: string } = {}
): Promise<StaticFeaturedExpert[]> {
  const now = new Date();
  try {
    const andClauses: object[] = [];
    if (options.country) {
      andClauses.push({ OR: [{ targetCountry: null }, { targetCountry: options.country }] });
    }
    if (options.category) {
      andClauses.push({ OR: [{ targetCategory: null }, { targetCategory: options.category }] });
    }

    const campaigns = await prisma.adCampaign.findMany({
      where: {
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gte: now },
        placement: { spot },
        ...(andClauses.length > 0 ? { AND: andClauses } : {}),
      },
      take: 8,
      include: {
        expert: {
          select: {
            name: true,
            profileLink: true,
            profilePicture: true,
            countryCode: true,
            categories: { select: { category: { select: { name: true } } } },
            reviews: { select: { rating: true } },
          },
        },
      },
    });

    return campaigns.map((c) => {
      const ratings = c.expert.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : null;
      return {
        campaignId: c.id,
        expertSlug: c.expert.profileLink ?? "",
        expertName: c.expert.name,
        profilePic: c.expert.profilePicture,
        countryCode: c.expert.countryCode,
        categories: c.expert.categories.map((ec) => ec.category.name),
        avgRating,
      };
    });
  } catch {
    return [];
  }
}
