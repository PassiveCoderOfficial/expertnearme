"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Crown, MapPin, Star, Filter, X, Search } from "lucide-react";

interface Expert {
  id: number;
  name: string;
  businessName?: string;
  profileLink?: string;
  shortDesc?: string;
  officeAddress?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  featured?: boolean;
  foundingExpert?: boolean;
  avgRating?: number | null;
  categories: { category: { id: number; name: string; slug: string } }[];
  reviews: { rating: number }[];
}

interface Category { id: number; name: string; slug: string }

interface SponsoredItem {
  id: number;
  name: string;
  foundingExpert: boolean;
  profileLink: string;
  categories: string[];
  avgRating: number | null;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function avgRating(reviews: { rating: number }[]) {
  return reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const countryCode = searchParams.get("country") || "bd";
  const initialQ = searchParams.get("q") || "";

  const [allExperts, setAllExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(initialQ);
  const [selectedCat, setSelectedCat] = useState("");
  const [radius, setRadius] = useState(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sponsored, setSponsored] = useState<SponsoredItem | null>(null);

  // Fetch all experts + categories for the country on mount
  useEffect(() => {
    (async () => {
      try {
        const [cr, pr] = await Promise.all([
          fetch(`/api/country/${countryCode}/categories`),
          fetch(`/api/country/${countryCode}/experts`),
        ]);
        const [cd, pd] = await Promise.all([cr.json(), pr.json()]);
        setCategories(cd.categories || []);
        setAllExperts(pd.experts || []);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    })();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {}
      );
    }
  }, [countryCode]);

  // Fetch sponsored expert from search API whenever query changes
  const fetchSponsored = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSponsored(null); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&country=${countryCode}`);
      const data = await res.json();
      setSponsored(data.sponsored ?? null);
    } catch { setSponsored(null); }
  }, [countryCode]);

  useEffect(() => {
    const t = setTimeout(() => fetchSponsored(query), 300);
    return () => clearTimeout(t);
  }, [query, fetchSponsored]);

  // Client-side filter of full expert list
  const filtered = allExperts.filter((e) => {
    const displayName = e.businessName || e.name;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = displayName.toLowerCase().includes(q);
      const matchDesc = e.shortDesc?.toLowerCase().includes(q);
      const matchCat = e.categories?.some(c => c.category.name.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    if (selectedCat) {
      if (!e.categories?.some(c => c.category.slug === selectedCat)) return false;
    }
    if (userLocation && e.latitude && e.longitude) {
      const d = calcDistance(userLocation.lat, userLocation.lng, e.latitude, e.longitude);
      e.distance = d;
      if (d > radius) return false;
    }
    // Exclude sponsored from regular results
    if (sponsored && e.id === sponsored.id) return false;
    return true;
  }).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  const primaryCat = (e: Expert) => e.categories?.[0]?.category;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white pt-16">
      {/* Sticky search bar */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search experts, services…"
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm transition-colors ${showFilters ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-white/10 text-slate-400 hover:text-white"}`}
            >
              <Filter className="w-4 h-4" /> Filters
              {(selectedCat || userLocation) && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-1" />}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-3 pb-1">
              <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-slate-800/60 border border-white/10 text-sm text-white rounded-xl px-3 py-1.5 outline-none">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              {userLocation && (
                <>
                  <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                    className="bg-slate-800/60 border border-white/10 text-sm text-white rounded-xl px-3 py-1.5 outline-none">
                    <option value={5}>Within 5km</option>
                    <option value={10}>Within 10km</option>
                    <option value={20}>Within 20km</option>
                    <option value={50}>Within 50km</option>
                    <option value={200}>Within 200km</option>
                  </select>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Location active
                  </span>
                </>
              )}
              {(query || selectedCat) && (
                <button onClick={() => { setQuery(""); setSelectedCat(""); setSponsored(null); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-slate-400">
          {isLoading
            ? "Searching…"
            : <><strong className="text-white">{filtered.length + (sponsored ? 1 : 0)}</strong> result{(filtered.length + (sponsored ? 1 : 0)) !== 1 ? "s" : ""} in <strong className="text-orange-400">{countryCode.toUpperCase()}</strong></>
          }
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Sponsored result */}
            {sponsored && (
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">Sponsored</p>
                <Link
                  href={`/${countryCode}/expert/${sponsored.profileLink}`}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/60 hover:border-amber-500/60 p-5 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-base shrink-0">
                    {initials(sponsored.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">{sponsored.name}</p>
                      {sponsored.foundingExpert && <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    {sponsored.categories[0] && (
                      <p className="text-sm text-slate-400 truncate">{sponsored.categories[0]}</p>
                    )}
                    {sponsored.avgRating !== null && sponsored.avgRating !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {sponsored.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-medium">
                    Sponsored
                  </span>
                </Link>
              </div>
            )}

            {/* Regular results */}
            {filtered.length === 0 && !sponsored ? (
              <div className="rounded-2xl border border-white/8 bg-slate-800/40 p-14 text-center">
                <p className="text-slate-400 text-sm mb-3">No experts found matching your search.</p>
                <button onClick={() => { setQuery(""); setSelectedCat(""); }} className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                  Clear filters
                </button>
              </div>
            ) : filtered.length > 0 ? (
              <div>
                {sponsored && <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Results</p>}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((e) => {
                    const displayName = e.businessName || e.name;
                    const rating = avgRating(e.reviews);
                    const cat = primaryCat(e);
                    return (
                      <Link
                        key={e.id}
                        href={`/${countryCode}/expert/${e.profileLink || e.id}`}
                        className="group rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 transition-colors p-5 block"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0">
                            {initials(displayName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm truncate">{displayName}</p>
                            {cat && <p className="text-xs text-orange-300 truncate">{cat.name}</p>}
                          </div>
                        </div>

                        {e.shortDesc && <p className="text-slate-400 text-xs line-clamp-2 mb-3">{e.shortDesc}</p>}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          {rating > 0 ? (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {rating.toFixed(1)} ({e.reviews.length})
                            </span>
                          ) : <span />}
                          {e.distance != null && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {e.distance.toFixed(1)}km
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />}>
      <SearchPageContent />
    </Suspense>
  );
}
