"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdFavorite, MdFavoriteBorder, MdSearch, MdVerified, MdOpenInNew } from "react-icons/md";
import { Star } from "lucide-react";

type Expert = {
  id: number;
  name: string;
  businessName: string | null;
  profileLink: string;
  profilePicture: string | null;
  shortDesc: string | null;
  verified: boolean;
  featured: boolean;
  countryCode: string | null;
  categories: { category: { name: string } }[];
  reviews: { rating: number }[];
};

type SavedItem = { id: number; createdAt: string; expert: Expert };

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return null;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

export default function SavedPage() {
  const [saved, setSaved]     = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/me/saved")
      .then(r => r.json())
      .then(d => setSaved(d.saved || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (expertId: number) => {
    setRemoving(expertId);
    await fetch("/api/me/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expertId }),
    });
    setSaved(prev => prev.filter(s => s.expert.id !== expertId));
    setRemoving(null);
  };

  const filtered = search
    ? saved.filter(s =>
        s.expert.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.expert.businessName || "").toLowerCase().includes(search.toLowerCase()) ||
        s.expert.categories.some(c => c.category.name.toLowerCase().includes(search.toLowerCase()))
      )
    : saved;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Experts</h1>
          <p className="text-slate-400 text-sm mt-0.5">{saved.length} expert{saved.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="bg-slate-800/40 border border-white/8 rounded-2xl p-12 text-center">
          <MdFavoriteBorder className="text-5xl text-slate-700 mx-auto mb-3" />
          <h2 className="text-white font-semibold mb-1">No saved experts yet</h2>
          <p className="text-slate-500 text-sm mb-6">Browse experts and tap the heart icon to save them here.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 rounded-xl text-slate-900 font-semibold text-sm transition-colors">
            Browse Experts
          </Link>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 max-w-xs">
            <MdSearch className="text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search saved…"
              className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ expert, createdAt }) => {
              const rating = avgRating(expert.reviews);
              return (
                <div key={expert.id} className="bg-slate-800/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors group">
                  {/* Cover / avatar area */}
                  <div className="h-24 bg-gradient-to-br from-slate-700/60 to-slate-800/80 relative">
                    <div className="absolute -bottom-5 left-4">
                      {expert.profilePicture ? (
                        <img src={expert.profilePicture} alt={expert.name} className="w-12 h-12 rounded-xl border-2 border-slate-800 object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl border-2 border-slate-800 bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center text-sm font-bold text-orange-400">
                          {expert.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => unsave(expert.id)}
                      disabled={removing === expert.id}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg text-red-400 transition-colors"
                      title="Remove from saved"
                    >
                      <MdFavorite className="text-base" />
                    </button>
                  </div>

                  <div className="p-4 pt-8">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-white text-sm">{expert.name}</p>
                          {expert.verified && <MdVerified className="text-blue-400 text-sm shrink-0" />}
                        </div>
                        {expert.businessName && (
                          <p className="text-xs text-slate-500">{expert.businessName}</p>
                        )}
                      </div>
                      {rating && (
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-0.5 shrink-0">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="text-xs text-amber-300 font-semibold">{rating}</span>
                        </div>
                      )}
                    </div>

                    {expert.shortDesc && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{expert.shortDesc}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {expert.categories.slice(0, 2).map(c => (
                        <span key={c.category.name} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">
                          {c.category.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <p className="text-xs text-slate-600">Saved {new Date(createdAt).toLocaleDateString()}</p>
                      {expert.profileLink && expert.countryCode && (
                        <Link
                          href={`/${expert.countryCode}/expert/${expert.profileLink}`}
                          className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium"
                        >
                          View Profile <MdOpenInNew />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
