import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Star, CheckCircle, Briefcase, DollarSign } from "lucide-react";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";
import AdFeaturedExpertsStatic from "@/components/ads/AdFeaturedExpertsStatic";
import { fetchFeaturedExperts } from "@/lib/fetchFeaturedExperts";

const AVAIL_DOT: Record<string, string> = {
  AVAILABLE: 'bg-green-500',
  AWAY:      'bg-yellow-400',
  BUSY:      'bg-red-500',
  VACATION:  'bg-blue-400',
};

export const revalidate = 3600;

type Props = { params: Promise<{ countryCode: string; slug: string }> };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function CountryCategoryPage({ params }: Props) {
  const { countryCode: raw, slug } = await params;
  const countryCode = raw.toLowerCase();

  try {
    // Fetch category & experts in parallel, skip reviews for now (load separately)
    const [category, expertCategories, sponsoredExperts] = await Promise.all([
      prisma.category.findFirst({
        where: { slug, countryCode, active: true },
        select: {
          id: true, name: true, slug: true, icon: true, description: true,
          _count: { select: { experts: true } },
        },
      }),
      prisma.expertCategory.findMany({
        where: {
          category: { slug, countryCode, active: true },
          expert: { countryCode, verified: true },
        },
        select: {
          expert: {
            select: {
              id: true,
              name: true,
              businessName: true,
              profilePicture: true,
              shortDesc: true,
              serviceTitle: true,
              verified: true,
              foundingExpert: true,
              featured: true,
              mapFeatured: true,
              latitude: true,
              longitude: true,
              profileLink: true,
              availabilityStatus: true,
              yearsOfExperience: true,
              startingRate: true,
              startingRateUnit: true,
              _count: { select: { reviews: true } },
              reviews: {
                select: { rating: true },
                take: 500,
              },
              categories: {
                select: {
                  category: { select: { name: true, icon: true, color: true } },
                },
                take: 3,
              },
            },
          },
        },
        orderBy: { expert: { featured: "desc" } },
      }),
      fetchFeaturedExperts("CATEGORY_FEATURED", { country: countryCode, category: slug }),
    ]);

    if (!category) notFound();

    const experts = expertCategories.map(({ expert }) => {
      const ratings = expert.reviews.map((r) => r.rating);
      const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null;
      return {
        id: expert.id,
        name: expert.businessName || expert.name,
        avatar: expert.profilePicture || null,
        avg,
        reviewCount: expert._count.reviews,
        shortDesc: expert.shortDesc || null,
        serviceTitle: expert.serviceTitle || null,
        verified: expert.verified,
        foundingExpert: expert.foundingExpert,
        featured: expert.featured,
        mapFeatured: expert.mapFeatured,
        latitude: expert.latitude || null,
        longitude: expert.longitude || null,
        profileLink: expert.profileLink || String(expert.id),
        availabilityStatus: expert.availabilityStatus || 'AVAILABLE',
        yearsOfExperience: expert.yearsOfExperience ?? null,
        startingRate: expert.startingRate ?? null,
        startingRateUnit: expert.startingRateUnit ?? null,
        categories: expert.categories.map((c) => ({
          name: c.category.name,
          icon: c.category.icon,
          color: c.category.color,
        })),
      };
    });

    const mapExperts: MapExpert[] = experts
      .filter(e => e.latitude && e.longitude)
      .sort((a, b) => ((b.mapFeatured || b.featured) ? 1 : 0) - ((a.mapFeatured || a.featured) ? 1 : 0))
      .map(e => ({
        id:          e.id,
        name:        e.name,
        profileLink: e.profileLink,
        latitude:    e.latitude!,
        longitude:   e.longitude!,
        verified:    e.verified,
        featured:    e.featured,
        mapFeatured: e.mapFeatured,
        shortDesc:   e.shortDesc,
        categories:  e.categories,
      }));

    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
            <Link href={`/${countryCode}`} prefetch className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">{countryCode.toUpperCase()}</Link>
            <span>/</span>
            <Link href={`/${countryCode}/categories`} prefetch className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Categories</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">{category.name}</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{category.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
            {category.description || `Browse verified ${category.name.toLowerCase()} experts in ${countryCode.toUpperCase()}.`}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-10">
            {experts.length} verified expert{experts.length !== 1 ? "s" : ""} found
          </p>

          {mapExperts.length > 0 && (
            <div className="mb-10">
              <ExpertMap experts={mapExperts} countryCode={countryCode} className="h-80 sm:h-96" />
            </div>
          )}

          {experts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-14 text-center">
              <p className="text-slate-400 dark:text-slate-400 text-sm mb-4">
                No verified experts in this category yet for {countryCode.toUpperCase()}.
              </p>
              <Link href="/for-experts" className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 text-sm transition-colors">
                Be the first to list here →
              </Link>
            </div>
          ) : (
            <>
              {sponsoredExperts.length > 0 && (
                <AdFeaturedExpertsStatic experts={sponsoredExperts} title="Sponsored in this Category" className="mb-6" />
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {experts.map((expert) => (
                  <Link
                    key={expert.id}
                    href={`/${countryCode}/expert/${expert.profileLink}`}
                    prefetch
                    className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/50 hover:-translate-y-1 hover:shadow-xl dark:hover:border-orange-500/20 transition-all duration-200 overflow-hidden shadow-sm"
                  >
                    {/* Cover banner */}
                    <div className="relative h-20 bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 overflow-hidden">
                      {expert.avatar && (
                        <img src={expert.avatar} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-30" aria-hidden />
                      )}
                      {expert.featured && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-900 uppercase tracking-wide">
                          Featured
                        </span>
                      )}
                      {expert.verified && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/80 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Avatar + rating row */}
                    <div className="-mt-7 mb-2 px-4 flex items-end justify-between">
                      <div className="relative">
                        {expert.avatar ? (
                          <img src={expert.avatar} alt={expert.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-md" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg border-2 border-white dark:border-slate-900 shadow-md">
                            {initials(expert.name)}
                          </div>
                        )}
                        {expert.foundingExpert && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px]">
                            👑
                          </span>
                        )}
                      </div>
                      {expert.avg !== null ? (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-400/20 mb-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {expert.avg.toFixed(1)}
                          <span className="font-normal text-yellow-600 dark:text-yellow-400/70">({expert.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">No reviews yet</span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="px-4 pb-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-orange-500 dark:group-hover:text-orange-300 transition-colors">
                          {expert.name}
                        </p>
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${AVAIL_DOT[expert.availabilityStatus] ?? 'bg-green-500'}`} title={expert.availabilityStatus} />
                      </div>

                      {expert.serviceTitle && (
                        <p className="text-[10px] text-orange-500 dark:text-orange-400 font-medium mb-1.5 line-clamp-1">{expert.serviceTitle}</p>
                      )}

                      {expert.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {expert.categories.slice(0, 2).map((cat) => (
                            <span key={cat.name} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-500/20 font-medium">
                              {cat.name}
                            </span>
                          ))}
                          {expert.categories.length > 2 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400">
                              +{expert.categories.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {expert.shortDesc && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 flex-1 mb-2 leading-relaxed">
                          {expert.shortDesc}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 mb-3">
                        {expert.yearsOfExperience != null && (
                          <span className="flex items-center gap-0.5">
                            <Briefcase className="w-3 h-3" /> {expert.yearsOfExperience}yr
                          </span>
                        )}
                        {expert.startingRate != null && (
                          <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400 font-semibold">
                            <DollarSign className="w-3 h-3" /> From ${expert.startingRate.toLocaleString()}{expert.startingRateUnit ?? ''}
                          </span>
                        )}
                      </div>

                      <span className="mt-auto text-xs font-semibold text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors self-end">
                        View Profile →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error("[CategoryPage] DB error:", err);
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-500 dark:text-red-400 mb-4">Unable to load this category right now.</p>
          <Link href={`/${countryCode}`} className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300">← Back</Link>
        </div>
      </div>
    );
  }
}
