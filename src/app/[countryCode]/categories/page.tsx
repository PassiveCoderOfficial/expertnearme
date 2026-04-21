"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Category = { id: number; name: string; slug: string; icon?: string; description?: string; expertCount?: number };

export default function CountryCategoriesPage() {
  const params = useParams<{ countryCode: string }>();
  const countryCode = typeof params?.countryCode === "string" ? params.countryCode.toLowerCase() : "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!countryCode) return;
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch(`/api/country/${countryCode}/categories`);
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
        setCategories(data.categories || []);
      } catch { setError("Failed to load categories"); }
      finally { setLoading(false); }
    })();
  }, [countryCode]);

  const sorted = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name)), [categories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white pt-16">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-400 mb-2">{countryCode.toUpperCase()}</p>
          <h1 className="text-3xl font-bold text-white">Browse Categories</h1>
          <p className="text-slate-400 mt-2 text-sm">Find the right expert type and browse verified listings.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500 text-sm">
            No categories found for this country yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map((cat) => (
              <Link
                key={cat.id}
                href={`/${countryCode}/categories/${cat.slug}`}
                className="rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/80 p-5 text-center transition-colors group"
              >
                <div className="text-3xl mb-3">{cat.icon || "🏢"}</div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{cat.name}</p>
                {cat.expertCount != null && (
                  <p className="text-xs text-slate-500 mt-1">{cat.expertCount} experts</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
