"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Star, Filter, X, Search } from "lucide-react";

interface Provider {
  id: number;
  name: string;
  businessName?: string;
  profileLink?: string;
  phone?: string;
  shortDesc?: string;
  officeAddress?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  category: { id: number; name: string; slug: string };
  reviews: { rating: number }[];
}

interface Category { id: number; name: string; slug: string }

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const countryCode = searchParams.get("country") || "bd";
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCat, setSelectedCat] = useState("");
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cr, pr] = await Promise.all([
          fetch(`/api/country/${countryCode}/categories`),
          fetch(`/api/country/${countryCode}/experts`),
        ]);
        const [cd, pd] = await Promise.all([cr.json(), pr.json()]);
        setCategories(cd.categories || []);
        const raw = (pd.experts || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          businessName: e.businessName,
          profileLink: e.profileLink,
          phone: e.phone,
          shortDesc: e.shortDesc,
          officeAddress: e.officeAddress,
          latitude: e.latitude,
          longitude: e.longitude,
          category: e.categories?.[0]?.category || { id: 0, name: "Uncategorized", slug: "uncategorized" },
          reviews: (e.reviews || []).map((r: any) => ({ rating: r.rating })),
        }));
        setProviders(raw);
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

  function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const filtered = providers.filter((p) => {
    const displayName = p.businessName || p.name;
    if (query && !displayName.toLowerCase().includes(query.toLowerCase()) && !p.shortDesc?.toLowerCase().includes(query.toLowerCase())) return false;
    if (selectedCat && p.category.slug !== selectedCat) return false;
    if (userLocation && p.latitude && p.longitude) {
      const d = calcDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
      p.distance = d;
      if (d > radius) return false;
    }
    return true;
  }).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  const avgRating = (reviews: { rating: number }[]) =>
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

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
              <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                className="bg-slate-800/60 border border-white/10 text-sm text-white rounded-xl px-3 py-1.5 outline-none">
                <option value={5}>Within 5km</option>
                <option value={10}>Within 10km</option>
                <option value={20}>Within 20km</option>
                <option value={50}>Within 50km</option>
              </select>
              {userLocation && (
                <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Location active
                </span>
              )}
              {(query || selectedCat) && (
                <button onClick={() => { setQuery(""); setSelectedCat(""); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-sm text-slate-400 mb-6">
          {isLoading ? "Searching…" : <><strong className="text-white">{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""} in <strong className="text-orange-400">{countryCode.toUpperCase()}</strong></>}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-slate-800/40 p-14 text-center">
            <p className="text-slate-400 text-sm mb-3">No experts found matching your search.</p>
            <button onClick={() => { setQuery(""); setSelectedCat(""); }} className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const displayName = p.businessName || p.name;
              const rating = avgRating(p.reviews);
              return (
                <div key={p.id} className="rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 transition-colors p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0">
                      {initials(displayName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{displayName}</p>
                      <p className="text-xs text-orange-300 truncate">{p.category.name}</p>
                    </div>
                  </div>

                  {p.shortDesc && <p className="text-slate-400 text-xs line-clamp-2 mb-3">{p.shortDesc}</p>}

                  <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
                    {rating > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {rating.toFixed(1)} ({p.reviews.length})
                      </span>
                    ) : <span />}
                    {p.distance && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {p.distance.toFixed(1)}km
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/${countryCode}/expert/${p.profileLink || p.id}`}
                    className="block text-center text-xs font-medium text-orange-400 hover:text-orange-300 border border-orange-500/20 hover:border-orange-500/40 rounded-lg py-1.5 transition-colors"
                  >
                    View Profile →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
