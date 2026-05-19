import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Users, Shield, Crown, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";
import { prisma } from "@/lib/db";
import AdFeaturedExpertsStatic from "@/components/ads/AdFeaturedExpertsStatic";
import { fetchFeaturedExperts } from "@/lib/fetchFeaturedExperts";
import CategoryGrid, { CategoryItem } from "@/components/CategoryGrid";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const countries = await prisma.country.findMany({
      where: { active: true },
      select: { code: true },
    });
    return countries.map(c => ({ countryCode: c.code }));
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ countryCode: string }>;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function avgRatingOf(reviews: { rating: number }[]) {
  if (!reviews.length) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default async function CountryPage({ params }: Props) {
  const { countryCode } = await params;
  const code = countryCode.toLowerCase();

  const [country, expertsRaw, categories, reviewAgg, sponsoredExperts] = await Promise.all([
    prisma.country.findFirst({ where: { code, active: true } }),
    prisma.expert.findMany({
      where: { countryCode: code, verified: true },
      select: {
        id: true, name: true, businessName: true, profileLink: true,
        profilePicture: true, shortDesc: true, verified: true,
        featured: true, foundingExpert: true, mapFeatured: true,
        latitude: true, longitude: true,
        _count: { select: { reviews: true } },
        categories: {
          select: { category: { select: { id: true, name: true, icon: true, color: true } } },
        },
      },
      orderBy: [{ featured: 'desc' }, { foundingExpert: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({
      where: { countryCode: code, active: true },
      select: { id: true, name: true, slug: true, icon: true, _count: { select: { experts: true } } },
      orderBy: [{ experts: { _count: 'desc' } }, { name: 'asc' }],
    }),
    prisma.review.aggregate({
      where: { expert: { countryCode: code } },
      _avg: { rating: true },
    }),
    fetchFeaturedExperts("COUNTRY_FEATURED", { country: code }),
  ]);

  const expertIds = expertsRaw.map(e => e.id);
  const ratingsRaw = expertIds.length > 0 ? await prisma.review.groupBy({
    by: ['expertId'],
    where: { expertId: { in: expertIds } },
    _avg: { rating: true },
  }) : [];
  const ratingMap = new Map(ratingsRaw.map(r => [r.expertId, r._avg.rating]));
  const experts = expertsRaw.map(e => ({
    ...e,
    reviews: ratingMap.get(e.id) != null ? [{ rating: ratingMap.get(e.id)! }] : [],
  }));

  if (!country) notFound();

  const countryName = country.name;
  const featured = experts.filter((e) => e.featured);
  const regular  = experts.filter((e) => !e.featured);

  const overallAvg = reviewAgg._avg.rating ? reviewAgg._avg.rating.toFixed(1) : null;

  const mapExperts: MapExpert[] = experts
    .filter((e) => e.latitude && e.longitude)
    .sort((a, b) => {
      const aF = (a.mapFeatured || a.featured) ? 1 : 0;
      const bF = (b.mapFeatured || b.featured) ? 1 : 0;
      return bF - aF;
    })
    .map(e => ({
      id:           e.id,
      name:         e.businessName || e.name,
      profileLink:  e.profileLink || String(e.id),
      latitude:     e.latitude!,
      longitude:    e.longitude!,
      verified:     e.verified,
      featured:     e.featured,
      mapFeatured:  e.mapFeatured,
      profilePicture: e.profilePicture ?? undefined,
      shortDesc:    e.shortDesc,
      categories:   e.categories.map(c => ({ name: c.category.name, icon: c.category.icon ?? null, color: c.category.color ?? null })),
    }));

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 bg-gradient-to-br from-slate-50 via-white to-orange-50/20 dark:from-transparent dark:via-transparent dark:to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 dark:bg-orange-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-orange-600 dark:hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300">{countryName}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4 text-slate-500 dark:text-slate-400 text-sm">
            <span className="text-2xl">{country.flagEmoji || "🌍"}</span>
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 dark:text-orange-400 uppercase tracking-widest text-xs font-semibold">{code}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
            Verified Experts in{" "}
            <span className="text-orange-500 dark:text-orange-400">{countryName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Browse local professionals, check reviews, and get in touch directly — no middleman.
          </p>

          <div className="max-w-xl mx-auto mb-10">
            <SearchBar currentCountry={code} placeholder={`Search experts in ${countryName}…`} />
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 rounded-2xl px-8 py-4 shadow-sm dark:shadow-none">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Users className="w-4 h-4 text-orange-500" />
              <strong className="text-slate-900 dark:text-white">{experts.length}</strong> Expert{experts.length !== 1 ? "s" : ""}
            </span>
            <span className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-green-500" />
              <strong className="text-slate-900 dark:text-white">{experts.filter((e) => e.verified).length}</strong> Verified
            </span>
            <span className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Star className="w-4 h-4 text-yellow-400" />
              <strong className="text-slate-900 dark:text-white">{overallAvg ?? "—"}</strong> Avg Rating
            </span>
            <span className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white">{categories.length}</strong> Categories
            </span>
          </div>
        </div>
      </section>

      {/* Expert Map */}
      {mapExperts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-1 font-semibold">Explore</p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Experts on the Map
              </h2>
            </div>
            <span className="text-xs text-slate-400">All experts on map · featured pins highlighted · click to view</span>
          </div>
          <ExpertMap experts={mapExperts} countryCode={code} className="h-[420px]" />
        </section>
      )}

      {/* Paid sponsored featured experts */}
      {sponsoredExperts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-6">
          <AdFeaturedExpertsStatic experts={sponsoredExperts} title="Sponsored Experts" />
        </section>
      )}

      {/* Organically featured */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Featured Experts</h2>
            <span className="text-xs bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">Featured</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((expert) => {
              const displayName = expert.businessName || expert.name;
              const avg = avgRatingOf(expert.reviews);
              return !expert.profileLink ? null : (
                <Link key={expert.id} href={`/${code}/expert/${expert.profileLink}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/50 hover:border-orange-200 dark:hover:border-orange-500/30 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-orange-500/5 transition-all duration-200 overflow-hidden shadow-sm dark:shadow-none touch-manipulation">

                  {/* Cover / banner */}
                  <div className="h-24 bg-gradient-to-br from-amber-500/20 via-orange-400/15 to-amber-600/10 dark:from-amber-500/20 dark:via-orange-500/10 dark:to-slate-800 relative overflow-hidden">
                    {expert.profilePicture && (
                      <img src={expert.profilePicture} alt="" aria-hidden className="w-full h-full object-cover opacity-20 dark:opacity-10 blur-sm scale-110" />
                    )}
                    {/* Badges row */}
                    <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                        <Crown className="w-2.5 h-2.5" /> FEATURED
                      </span>
                      {expert.verified && (
                        <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/30">
                          <CheckCircle className="w-2.5 h-2.5" /> VERIFIED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar overlapping banner */}
                  <div className="px-5 pb-5">
                    <div className="-mt-8 mb-3 flex items-end justify-between">
                      <div className="relative">
                        {expert.profilePicture ? (
                          <img src={expert.profilePicture} alt={displayName}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white dark:border-slate-800 shadow-md">
                            {initials(displayName)}
                          </div>
                        )}
                        {expert.foundingExpert && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border border-white dark:border-slate-800" title="Founding Expert">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      {avg && (
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl px-2.5 py-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{avg.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({expert.reviews.length})</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
                      {displayName}
                    </h3>

                    {expert.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {expert.categories.slice(0, 2).map((c) => (
                          <span key={c.category.id} className="text-[11px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 px-2 py-0.5 rounded-full">
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {expert.shortDesc && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">{expert.shortDesc}</p>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/8">
                      <span className="flex-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-300 bg-slate-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-slate-200 dark:border-white/10 py-2 rounded-xl transition-colors">
                        View Profile
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-1 font-semibold">What we cover</p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Browse by Category</h2>
            </div>
            <Link href={`/${code}/categories`} prefetch className="text-sm text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CategoryGrid
            categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, expertCount: c._count.experts }))}
            countryCode={code}
            initialCount={20}
            batchSize={20}
          />
        </section>
      )}

      {/* All Experts */}
      <section id="experts" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            All Experts
            <span className="text-slate-400 font-normal text-sm ml-2">({regular.length})</span>
          </h2>
        </div>

        {regular.length === 0 && featured.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-slate-800/40 p-14 text-center">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-3">No experts listed in {countryName} yet.</p>
            <Link href="/pricing" className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
              Be the first to list here →
            </Link>
          </div>
        ) : regular.length === 0 ? null : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regular.map((expert) => {
              const displayName = expert.businessName || expert.name;
              const avg = avgRatingOf(expert.reviews);
              return (
                <Link key={expert.id} href={`/${code}/expert/${expert.profileLink || expert.id}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/50 hover:border-orange-200 dark:hover:border-orange-500/30 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-orange-500/5 transition-all duration-200 overflow-hidden shadow-sm dark:shadow-none touch-manipulation">

                  {/* Cover banner */}
                  <div className="h-20 bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50/30 dark:from-slate-700/50 dark:via-slate-800 dark:to-slate-800 relative overflow-hidden">
                    {expert.profilePicture && (
                      <img src={expert.profilePicture} alt="" aria-hidden className="w-full h-full object-cover opacity-15 dark:opacity-10 blur-sm scale-110" />
                    )}
                    {expert.verified && (
                      <span className="absolute top-2 right-2.5 inline-flex items-center gap-1 bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/30">
                        <CheckCircle className="w-2.5 h-2.5" /> VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="px-5 pb-5">
                    {/* Avatar + rating row */}
                    <div className="-mt-7 mb-3 flex items-end justify-between">
                      <div className="relative">
                        {expert.profilePicture ? (
                          <img src={expert.profilePicture} alt={displayName}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg border-2 border-white dark:border-slate-800 shadow-md">
                            {initials(displayName)}
                          </div>
                        )}
                        {expert.foundingExpert && (
                          <span className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-amber-400 rounded-full flex items-center justify-center border border-white dark:border-slate-800" title="Founding Expert">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      {avg ? (
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{avg.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400">({expert.reviews.length})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/8 px-2 py-1 rounded-lg">No reviews yet</span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
                      {displayName}
                    </h3>

                    {expert.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {expert.categories.slice(0, 2).map((c) => (
                          <span key={c.category.id} className="text-[11px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 px-2 py-0.5 rounded-full">
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {expert.shortDesc && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">{expert.shortDesc}</p>
                    )}

                    <div className="pt-3 border-t border-slate-100 dark:border-white/8">
                      <span className="block text-center text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-300 bg-slate-50 dark:bg-white/5 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 border border-slate-200 dark:border-white/10 group-hover:border-orange-200 dark:group-hover:border-orange-500/20 py-2 rounded-xl transition-colors">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Are you an expert in {countryName}?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">List your business and get discovered by local clients.</p>
          </div>
          <Link href="/pricing" className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-orange-500/20">
            List Your Business →
          </Link>
        </div>
      </section>
    </div>
  );
}
