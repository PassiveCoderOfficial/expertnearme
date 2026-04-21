"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Star, Users, Shield, Crown, ChevronRight, ArrowRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";

interface Expert {
  id: string;
  name: string;
  businessName?: string;
  profileLink: string;
  profilePicture?: string;
  shortDesc?: string;
  verified: boolean;
  featured?: boolean;
  mapFeatured?: boolean;
  foundingExpert?: boolean;
  latitude?: number;
  longitude?: number;
  reviews: { rating: number }[];
  categories: Array<{ category: { id: string; name: string } }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  _count: { experts: number };
}

interface Country { code: string; name: string; flagEmoji?: string }

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function avgRatingOf(reviews: { rating: number }[]) {
  if (!reviews.length) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function CountryPage() {
  const params = useParams<{ countryCode: string }>();
  const countryCode = typeof params?.countryCode === "string" ? params.countryCode.toLowerCase() : "";
  const [country, setCountry] = useState<Country | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) return;
    (async () => {
      try {
        const [cr, er, catr] = await Promise.all([
          fetch(`/api/country/${countryCode}`),
          fetch(`/api/country/${countryCode}/experts`),
          fetch(`/api/country/${countryCode}/categories`),
        ]);
        const [cd, ed, catd] = await Promise.all([cr.json(), er.json(), catr.json()]);
        if (cd.ok) setCountry(cd.country);
        if (ed.ok) setExperts(ed.experts || []);
        if (catd.ok) setCategories(catd.categories || []);
        if (!cd.ok) setError(cd.error || "Country not found");
      } catch { setError("Network error"); }
      finally { setLoading(false); }
    })();
  }, [countryCode]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-orange-400 hover:text-orange-300">← All Countries</Link>
      </div>
    </div>
  );

  const countryName = country?.name || countryCode.toUpperCase();
  const featured = experts.filter((e) => e.featured);
  const regular = experts.filter((e) => !e.featured);
  const overallAvg = experts.length
    ? (experts.flatMap((e) => e.reviews).reduce((s, r) => s + r.rating, 0) /
        Math.max(experts.flatMap((e) => e.reviews).length, 1)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300">{countryName}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-sm">
            <span className="text-2xl">{country?.flagEmoji || "🌍"}</span>
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 uppercase tracking-widest text-xs font-semibold">{countryCode}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Verified Experts in{" "}
            <span className="text-orange-400">{countryName}</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Browse local professionals, check reviews, and get in touch directly — no middleman.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-10">
            <SearchBar currentCountry={countryCode} placeholder={`Search experts in ${countryName}…`} />
          </div>

          {/* Stats */}
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

      {/* ─── Expert Map ───────────────────────────────────────────── */}
      {experts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-400 mb-1">Explore</p>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Experts on the Map
              </h2>
            </div>
            <span className="text-xs text-slate-500">Click a pin to view profile</span>
          </div>
          <ExpertMap
            experts={experts.map((e) => ({
              id: Number(e.id),
              name: (e as any).businessName || e.name,
              profileLink: e.profileLink || String(e.id),
              latitude: (e as any).latitude || 0,
              longitude: (e as any).longitude || 0,
              verified: e.verified,
              featured: e.featured ?? false,
              mapFeatured: (e as any).mapFeatured ?? false,
              profilePicture: (e as any).profilePicture,
              shortDesc: (e as any).shortDesc,
              categories: e.categories?.map((c: any) => c.category.name),
            } as MapExpert))}
            countryCode={countryCode}
            className="h-[420px]"
          />
        </section>
      )}

      {/* ─── Featured / Sponsored Experts ─────────────────────────── */}
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
                <Link
                  key={expert.id}
                  href={`/${countryCode}/expert/${expert.profileLink}`}
                  className="group rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-slate-800/60 hover:border-amber-500/50 hover:from-amber-500/12 transition-all overflow-hidden"
                >
                  <div className="h-20 bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center relative">
                    {expert.profilePicture ? (
                      <img src={expert.profilePicture} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 font-bold">
                        {initials(displayName)}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-xs bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                      ★ Featured
                    </span>
                    {expert.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-1.5">
                      <h3 className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors flex-1">
                        {displayName}
                      </h3>
                      {expert.foundingExpert && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                    </div>
                    {expert.categories?.length > 0 && (
                      <p className="text-xs text-orange-300 mb-2">{expert.categories[0].category.name}</p>
                    )}
                    {expert.shortDesc && (
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3">{expert.shortDesc}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {avg ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {avg.toFixed(1)} ({expert.reviews.length})
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

      {/* ─── Categories ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Browse by Category</h2>
            <Link href={`/${countryCode}/categories`} className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/${countryCode}/categories/${cat.slug}`}
                className="rounded-xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/80 p-4 text-center transition-colors group"
              >
                <div className="text-2xl mb-2">{cat.icon || "🏢"}</div>
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">{cat.name}</p>
                <p className="text-xs text-slate-600 mt-1">{cat._count?.experts || 0} experts</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── All Experts ──────────────────────────────────────────── */}
      <section id="experts" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">
            All Experts
            <span className="text-slate-500 font-normal text-sm ml-2">({regular.length})</span>
          </h2>
        </div>

        {regular.length === 0 && featured.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-slate-800/40 p-14 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-3">No experts listed in {countryName} yet.</p>
            <Link href="/for-experts" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
              Be the first to list here →
            </Link>
          </div>
        ) : regular.length === 0 ? null : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regular.map((expert) => {
              const displayName = expert.businessName || expert.name;
              const avg = avgRatingOf(expert.reviews);
              return (
                <Link
                  key={expert.id}
                  href={`/${countryCode}/expert/${expert.profileLink}`}
                  className="group rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/70 transition-colors overflow-hidden"
                >
                  <div className="h-20 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
                    {expert.profilePicture ? (
                      <img src={expert.profilePicture} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold">
                        {initials(displayName)}
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

                    {expert.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {expert.categories.slice(0, 2).map((c) => (
                          <span key={c.category.id} className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/15 px-2 py-0.5 rounded-full">
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {expert.shortDesc && (
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3">{expert.shortDesc}</p>
                    )}

                    <div className="flex items-center justify-between">
                      {avg ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {avg.toFixed(1)} ({expert.reviews.length})
                        </span>
                      ) : <span />}
                      <span className="text-xs text-orange-400 group-hover:text-orange-300 transition-colors">View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── For Experts CTA ──────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Are you an expert in {countryName}?</h3>
            <p className="text-slate-400 text-sm">List your business and get discovered by local clients.</p>
          </div>
          <Link
            href="/for-experts"
            className="shrink-0 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            List Your Business →
          </Link>
        </div>
      </section>
    </div>
  );
}
