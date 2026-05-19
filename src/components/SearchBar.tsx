"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Crown, Star, Tag } from "lucide-react";
import Link from "next/link";

type ExpertItem = {
  id: number;
  name: string;
  isBusiness: boolean;
  featured: boolean;
  foundingExpert: boolean;
  profileLink: string;
  categories: string[];
  avgRating: number | null;
};

type CategoryItem = { id: number; name: string; slug: string; icon?: string | null };

type SearchBarProps = {
  currentCountry?: string;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  currentCountry = "bd",
  placeholder = "Search experts, services…",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [sponsored, setSponsored] = useState<ExpertItem | null>(null);
  const [providers, setProviders] = useState<ExpertItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setSponsored(null);
        setProviders([]);
        setCategories([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&country=${encodeURIComponent(currentCountry)}`
        );
        const data = await res.json();
        setSponsored(data.sponsored ?? null);
        setProviders(data.providers ?? []);
        setCategories(data.categories ?? []);
        setOpen(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, currentCountry]);

  const closeAndClear = () => {
    setOpen(false);
    setQuery("");
  };

  const goSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}&country=${currentCountry}`);
    setOpen(false);
  };

  const hasResults = !!sponsored || providers.length > 0 || categories.length > 0;

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* Input */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/60 focus-within:border-orange-500 dark:focus-within:border-orange-500/40 transition-colors">
        <div className="flex items-center pl-4 text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goSearch()}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
        />
        <button
          onClick={goSearch}
          className="bg-orange-500 hover:bg-orange-400 px-5 py-3 text-white font-bold transition-colors text-sm shrink-0"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-[60] overflow-hidden">
          {loading && (
            <div className="px-4 py-3 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
              <div className="w-3.5 h-3.5 rounded-full border border-orange-500 border-t-transparent animate-spin" />
              Searching…
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-4 text-center text-slate-400 dark:text-slate-500 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && hasResults && (
            <>
              {/* Sponsored expert */}
              {sponsored && (
                <div className="border-b border-slate-100 dark:border-white/8">
                  <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                      Sponsored
                    </span>
                  </div>
                  <Link
                    href={`/${currentCountry}/expert/${sponsored.profileLink}`}
                    prefetch
                    onClick={closeAndClear}
                    className="w-full text-left px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-500/8 transition-colors group flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {sponsored.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate">
                          {sponsored.name}
                        </p>
                        {sponsored.foundingExpert && (
                          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                      {sponsored.categories.length > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{sponsored.categories[0]}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                        Sponsored
                      </span>
                      {sponsored.avgRating !== null && (
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {sponsored.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* Regular experts */}
              {providers.length > 0 && (
                <div className={categories.length > 0 ? "border-b border-slate-100 dark:border-white/8" : ""}>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Experts
                    </span>
                  </div>
                  {providers.map((p) => (
                    <Link
                      key={p.id}
                      href={`/${currentCountry}/expert/${p.profileLink}`}
                      prefetch
                      onClick={closeAndClear}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/40 to-amber-400/40 flex items-center justify-center text-orange-600 dark:text-orange-300 font-bold text-xs shrink-0">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-slate-800 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-300 transition-colors truncate">
                            {p.name}
                          </p>
                          {p.foundingExpert && (
                            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                          )}
                        </div>
                        {p.categories.length > 0 && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{p.categories[0]}</p>
                        )}
                      </div>
                      {p.avgRating !== null && (
                        <span className="flex items-center gap-0.5 text-xs text-slate-400 dark:text-slate-500 shrink-0">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {p.avgRating.toFixed(1)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Categories
                    </span>
                  </div>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/${currentCountry}/categories/${c.slug}`}
                      prefetch
                      onClick={closeAndClear}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                        {c.icon || <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {c.name}
                      </p>
                      <span className="ml-auto text-xs text-slate-400 dark:text-slate-600">Category</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* View all results footer */}
              <div className="border-t border-slate-100 dark:border-white/8 px-4 py-2.5">
                <button
                  onClick={goSearch}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  View all results for &ldquo;{query}&rdquo; →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
