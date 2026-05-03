import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const country = searchParams.get("country")?.toLowerCase() || "";

  if (q.length < 2) {
    return NextResponse.json({ sponsored: null, providers: [], categories: [] });
  }

  const [expertResults, categoryResults] = await Promise.all([
    prisma.expert.findMany({
      where: {
        ...(country ? { countryCode: country } : {}),
        OR: [
          { name: { contains: q } },
          { businessName: { contains: q } },
          { shortDesc: { contains: q } },
          { categories: { some: { category: { name: { contains: q } } } } },
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
        name: { contains: q },
      },
      take: 5,
    }),
  ]);

  const toItem = (e: (typeof expertResults)[0]) => ({
    id: e.id,
    name: e.businessName || e.name,
    isBusiness: e.isBusiness,
    featured: e.featured,
    foundingExpert: e.foundingExpert,
    profileLink: e.profileLink || String(e.id),
    categories: e.categories.map((c) => c.category.name),
    avgRating:
      e.reviews.length > 0
        ? e.reviews.reduce((s, r) => s + r.rating, 0) / e.reviews.length
        : null,
  });

  const sponsored = expertResults.find((e) => e.featured) ?? null;
  const providers = expertResults
    .filter((e) => !e.featured)
    .slice(0, 6)
    .map(toItem);

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
