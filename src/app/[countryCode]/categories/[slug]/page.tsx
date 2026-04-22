import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Star, Shield, Crown } from "lucide-react";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";

type Props = { params: Promise<{ countryCode: string; slug: string }> };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function CountryCategoryPage({ params }: Props) {
  const { countryCode: raw, slug } = await params;
  const countryCode = raw.toLowerCase();

  let category: Awaited<ReturnType<typeof prisma.category.findFirst>> | null = null;
  try {
    category = await prisma.category.findFirst({
      where: { slug, countryCode, active: true },
      include: { _count: { select: { experts: true } } },
    });
  } catch (err) {
    console.error("[CategoryPage] DB error:", err);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-400 mb-4">Unable to load this category right now.</p>
          <Link href={`/${countryCode}`} className="text-orange-400 hover:text-orange-300">← Back</Link>
        </div>
      </div>
    );
  }

  if (!category) notFound();

  let expertCategories: Awaited<ReturnType<typeof prisma.expertCategory.findMany>> = [];
  try {
    expertCategories = await prisma.expertCategory.findMany({
      where: { categoryId: category.id, expert: { countryCode, verified: true } },
      include: {
        expert: {
          include: {
            categories: { include: { category: { select: { name: true, icon: true, color: true } } } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { expert: { featured: "desc" } },
    });
  } catch (err) {
    console.error("[CategoryPage] experts DB error:", err);
  }

  const experts = expertCategories.map(({ expert }) => {
    const ratings = expert.reviews.map((r) => r.rating);
    const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null;
    return {
      id: expert.id,
      name: expert.businessName || expert.name,
      avatar: expert.profilePicture || null,
      avg,
      reviewCount: ratings.length,
      shortDesc: expert.shortDesc || null,
      verified: expert.verified,
      foundingExpert: expert.foundingExpert,
      featured: expert.featured,
      mapFeatured: expert.mapFeatured,
      latitude: expert.latitude || null,
      longitude: expert.longitude || null,
      profileLink: expert.profileLink || String(expert.id),
      categories: expert.categories.map((c) => ({ name: c.category.name, icon: c.category.icon, color: c.category.color })),
    };
  });

  // Prepare MapExpert list: up to 20 map-featured first, then fill with others
  const mapExperts: MapExpert[] = experts
    .filter(e => e.latitude && e.longitude)
    .map(e => ({
      id:             e.id,
      name:           e.name,
      profileLink:    e.profileLink,
      latitude:       e.latitude!,
      longitude:      e.longitude!,
      verified:       e.verified,
      featured:       e.featured,
      mapFeatured:    e.mapFeatured,
      shortDesc:      e.shortDesc,
      categories:     e.categories,
    }))
    .sort((a, b) => (b.mapFeatured ? 1 : 0) - (a.mapFeatured ? 1 : 0))
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white pt-16">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href={`/${countryCode}`} className="hover:text-orange-400 transition-colors">{countryCode.toUpperCase()}</Link>
          <span>/</span>
          <Link href={`/${countryCode}/categories`} className="hover:text-orange-400 transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-white">{category.name}</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
        <p className="text-slate-400 text-sm mb-1">
          {category.description || `Browse verified ${category.name.toLowerCase()} experts in ${countryCode.toUpperCase()}.`}
        </p>
        <p className="text-slate-500 text-xs mb-10">{experts.length} verified expert{experts.length !== 1 ? "s" : ""} found</p>

        {/* Map section */}
        {mapExperts.length > 0 && (
          <div className="mb-10">
            <ExpertMap
              experts={mapExperts}
              countryCode={countryCode}
              className="h-80 sm:h-96"
            />
          </div>
        )}

        {experts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
            <p className="text-slate-400 text-sm mb-4">No verified experts in this category yet for {countryCode.toUpperCase()}.</p>
            <Link href="/for-experts" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
              Be the first to list here →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {experts.map((expert) => (
              <Link
                key={expert.id}
                href={`/${countryCode}/expert/${expert.profileLink}`}
                className="rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/70 transition-colors group p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  {expert.avatar ? (
                    <img src={expert.avatar} alt={expert.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold shrink-0">
                      {initials(expert.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-white text-sm truncate group-hover:text-orange-300 transition-colors">{expert.name}</p>
                      {expert.foundingExpert && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {expert.verified && (
                        <span className="flex items-center gap-0.5 text-xs text-green-400">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {expert.avg !== null && (
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {expert.avg.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {expert.shortDesc && (
                  <p className="text-slate-400 text-xs line-clamp-2 flex-1 mb-3">{expert.shortDesc}</p>
                )}

                <span className="text-xs text-orange-400 group-hover:text-orange-300 transition-colors self-end">
                  View Profile →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
