import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const country = searchParams.get("country")?.toLowerCase() || "";

  if (q.length < 2) {
    return NextResponse.json({ sponsored: null, providers: [], categories: [] });
  }

  const now = new Date();
  const [expertResults, categoryResults, sponsorCampaigns] = await Promise.all([
    prisma.expert.findMany({
      where: {
        ...(country ? { countryCode: country } : {}),
        profileVisible: true,
        verified: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { businessName: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
          { serviceTitle: { contains: q, mode: "insensitive" } },
          { categories: { some: { category: { name: { contains: q, mode: "insensitive" } } } } },
          { skills: { some: { name: { contains: q, mode: "insensitive" } } } },
          { industries: { some: { name: { contains: q, mode: "insensitive" } } } },
        ],
      },
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ featured: "desc" }, { foundingExpert: "desc" }],
      take: 10,
    }),
    prisma.category.findMany({
      where: {
        active: true,
        ...(country ? { countryCode: country } : {}),
        name: { contains: q, mode: "insensitive" },
      },
      take: 5,
    }),
    prisma.adCampaign.findMany({
      where: {
        spot: "SEARCH_SPONSOR",
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gte: now },
        ...(country ? {
          OR: [{ targetCountry: null }, { targetCountry: country.toUpperCase() }],
        } : {}),
      },
      include: {
        expert: {
          include: {
            categories: { include: { category: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      take: 3,
    }).catch(() => []),
  ]);

  const toItem = (e: (typeof expertResults)[0]) => ({
    id: e.id,
    name: e.businessName || e.name,
    isBusiness: e.isBusiness,
    featured: e.featured,
    foundingExpert: e.foundingExpert,
    profileLink: e.profileLink || String(e.id),
    categories: e.categories.map((c) => c.category.name),
    serviceTitle: (e as unknown as { serviceTitle?: string | null }).serviceTitle ?? null,
    availabilityStatus: (e as unknown as { availabilityStatus?: string }).availabilityStatus ?? 'AVAILABLE',
    startingRate: (e as unknown as { startingRate?: number | null }).startingRate ?? null,
    startingRateUnit: (e as unknown as { startingRateUnit?: string | null }).startingRateUnit ?? null,
    yearsOfExperience: (e as unknown as { yearsOfExperience?: number | null }).yearsOfExperience ?? null,
    avgRating:
      e.reviews.length > 0
        ? e.reviews.reduce((s, r) => s + r.rating, 0) / e.reviews.length
        : null,
  });

  // Pick sponsored: active SEARCH_SPONSOR campaign first, fall back to featured expert
  const sponsorExpert = sponsorCampaigns.length > 0
    ? sponsorCampaigns[Math.floor(Math.random() * sponsorCampaigns.length)].expert
    : null;
  const sponsored = sponsorExpert ?? expertResults.find((e) => e.featured) ?? null;
  const sponsoredId = sponsored?.id ?? null;
  const providers = expertResults
    .filter((e) => e.id !== sponsoredId)
    .slice(0, 6)
    .map(toItem);

  // Fire-and-forget impression tracking for ad campaign
  if (sponsorCampaigns.length > 0 && sponsorExpert) {
    const campaign = sponsorCampaigns.find(c => c.expert.id === sponsorExpert.id);
    if (campaign) {
      prisma.adCampaign.update({
        where: { id: campaign.id },
        data: { impressions: { increment: 1 } },
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    sponsored: sponsored ? toItem(sponsored) : null,
    providers,
    categories: categoryResults.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
    })),
  });
}
