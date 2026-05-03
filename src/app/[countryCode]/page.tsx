import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Users, Shield, Crown, ChevronRight, ArrowRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";
import { prisma } from "@/lib/db";

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

  const [country, experts, categories] = await Promise.all([
    prisma.country.findFirst({ where: { code, active: true } }),
    prisma.expert.findMany({
      where: { countryCode: code, verified: true },
      include: {
        reviews: { select: { rating: true } },
        categories: { include: { category: { select: { id: true, name: true, icon: true, color: true } } } },
      },
      orderBy: [{ featured: 'desc' }, { foundingExpert: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({
      where: { countryCode: code, active: true },
      include: { _count: { select: { experts: true } } },
      orderBy: { name: 'asc' },
      take: 10,
    }),
  ]);

  if (!country) notFound();

  const countryName = country.name;
  const featured = experts.filter((e) => e.featured);
  const regular  = experts.filter((e) => !e.featured);

  const allReviews = experts.flatMap((e) => e.reviews);
  const overallAvg = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : null;

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
    <>
      <MobileFirstHero onScrollTo="experts" />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300">{countryName}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-sm">
            <span className="text-2xl">{country.flagEmoji || "🌍"}</span>
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 uppercase tracking-widest text-xs font-semibold">{code}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Verified Experts in{" "}
            <span className="text-orange-400">{countryName}</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Browse local professionals, check reviews, and get in touch directly — no middleman.
          </p>

          <div className="max-w-xl mx-auto mb-10">
            <SearchBar currentCountry={code} placeholder={`Search experts in ${countryName}…`} />
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm bg-slate-800/50 border border-white/8 rounded-2xl px-8 py-4">
            <span className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4 text-orange-400" />
              <strong className="text-white">{experts.length}</strong> Expert{experts.length !== 1 ? "s" : ""}
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-green-400" />
              <strong className="text-white">{experts.filter((e) => e.verified).length}</strong> Verified
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-2 text-slate-400">
              <Star className="w-4 h-4 text-yellow-400" />
              <strong className="text-white">{overallAvg ?? "—"}</strong> Avg Rating
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-2 text-slate-400">
              <strong className="text-white">{categories.length}</strong> Categories
            </span>
          </div>
        </div>
      </section>

      {/* Expert Map */}
      {mapExperts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-400 mb-1">Explore</p>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Experts on the Map
              </h2>
            </div>
            <span className="text-xs text-slate-500">All experts on map · featured pins highlighted · click to view</span>
          </div>
          <ExpertMap experts={mapExperts} countryCode={code} className="h-[420px]" />
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center gap-3 mb-5">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Featured Experts</h2>
            <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">Sponsored</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((expert) => {
              const displayName = expert.businessName || expert.name;
              const avg = avgRatingOf(expert.reviews);
              return (
                <Link key={expert.id} href={`/${code}/expert/${expert.profileLink || expert.id}`}
                  className="group rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-slate-800/60 hover:border-amber-500/50 hover:from-amber-500/12 transition-all overflow-hidden block touch-manipulation">
                  <div className="h-20 bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center relative">
                    {expert.profilePicture ? (
                      <img src={expert.profilePicture} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 font-bold">
                        {initials(displayName)}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-xs bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">★ Featured</span>
                    {expert.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-1.5">
                      <h3 className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors flex-1">{displayName}</h3>
                      {expert.foundingExpert && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                    </div>
                    {expert.categories.length > 0 && (
                      <p className="text-xs text-orange-300 mb-2">{expert.categories[0].category.name}</p>
                    )}
                    {expert.shortDesc && <p className="text-slate-400 text-xs line-clamp-2 mb-3">{expert.shortDesc}</p>}
                    <div className="flex items-center justify-between">
                      {avg ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {avg.toFixed(1)} ({expert.reviews.length})
                        </span>
                      ) : <span />}
                      <span className="text-xs text-amber-400 group-hover:text-amber-300 transition-colors">View Profile →</span>
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
            <h2 className="text-base font-bold text-white">Browse by Category</h2>
            <Link href={`/${code}/categories`} className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${code}/categories/${cat.slug}`}
                className="rounded-xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/80 p-4 text-center transition-colors group">
                <div className="text-2xl mb-2">{cat.icon || "🏢"}</div>
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">{cat.name}</p>
                <p className="text-xs text-slate-600 mt-1">{cat._count.experts} experts</p>
              </Link>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">Categories coming soon for {countryName}.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Experts */}
      <section id="experts" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">
            All Experts
            <span className="text-slate-500 font-normal text-sm ml-2">({regular.length})</span>
          </h2>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find the Right Expert</h2>
            <p className="text-lg text-gray-600">
              Search by name, service, or specialty
            </p>
          </div>
        ) : regular.length === 0 ? null : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regular.map((expert) => {
              const displayName = expert.businessName || expert.name;
              const avg = avgRatingOf(expert.reviews);
              return (
                <Link key={expert.id} href={`/${code}/expert/${expert.profileLink || expert.id}`}
                  className="group rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/70 transition-colors overflow-hidden block touch-manipulation">
                  <div className="h-20 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
                    {expert.profilePicture ? (
                      <img 
                        src={expert.profilePicture} 
                        alt={expert.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {expert.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    {expert.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="font-semibold text-white text-sm group-hover:text-orange-300 transition-colors flex-1">{displayName}</h3>
                      {expert.foundingExpert && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                    </div>
                    {expert.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {expert.categories.slice(0, 2).map((c) => (
                          <span key={c.category.id} className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/15 px-2 py-0.5 rounded-full">
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {expert.shortDesc && <p className="text-slate-400 text-xs line-clamp-2 mb-3">{expert.shortDesc}</p>}
                    <div className="flex items-center justify-between">
                      {avg ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {avg.toFixed(1)} ({expert.reviews.length})
                        </span>
                      ))}
                      {expert.categories?.length! > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          +{expert.categories!.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {expert.shortDesc || "Professional service provider with expertise in various fields."}
                    </p>
                    
                    {/* Contact Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {expert.phone && (
                        <div className="flex items-center gap-1">
                          <span>📞 Available</span>
                        </div>
                      )}
                      {expert.email && (
                        <div className="flex items-center gap-1">
                          <span>📧 Contact</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Are you an expert in {countryName}?</h3>
            <p className="text-slate-400 text-sm">List your business and get discovered by local clients.</p>
          </div>
          <Link href="/for-experts" className="shrink-0 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            List Your Business →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            We're constantly adding new experts to our platform. If you don't see what you need, contact us or become a verified expert yourself.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create-expert-account"
              className="px-10 py-4 bg-white text-orange-600 font-bold rounded-xl text-lg hover:bg-gray-100 transition-colors shadow-2xl"
            >
              Join as Expert
            </Link>
            <Link 
              href="/contact"
              className="px-10 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-lg hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}