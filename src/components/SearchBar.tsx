// File: src/components/SearchBar.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProviderItem = { id: number; name: string; isBusiness: boolean; featured?: boolean };
type CategoryItem = { id: number; name: string; slug: string };

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [sponsored, setSponsored] = useState<ProviderItem | null>(null);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Debounced fetch
  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setSponsored(null);
        setProviders([]);
        setCategories([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSponsored(data.sponsored ?? null);
      setProviders(data.providers ?? []);
      setCategories(data.categories ?? []);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const goProvider = (id: number) => {
    router.push(`/providers/${id}`);
    setOpen(false);
  };

  const goCategory = (slug: string) => {
    router.push(`/categories/${slug}`);
    setOpen(false);
  };

  const typeLabel = (isBusiness: boolean) => (isBusiness ? "Business" : "Person");

  const hasResults = !!sponsored || providers.length > 0 || categories.length > 0;

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search providers or categories..."
          className="border border-gray-300 rounded-l px-4 py-2 w-full"
        />
        <button
          onClick={() => setOpen(true)}
          className="bg-[#b84c4c] text-white px-4 rounded-r"
        >
          Search
        </button>
      </div>

      {open && hasResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-lg z-50 mt-1">
          {/* Sponsored (single, on top) */}
          {sponsored && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">Sponsored</div>
              <button
                onClick={() => goProvider(sponsored.id)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{sponsored.name}</span>
                  <span className="text-xs text-gray-500">{typeLabel(sponsored.isBusiness)}</span>
                </div>
                <span className="text-xs bg-yellow-400 text-white px-2 py-0.5 rounded">Sponsored</span>
              </button>
              <div className="h-px bg-gray-200" />
            </div>
          )}

          {/* Providers */}
          {providers.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">Providers</div>
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goProvider(p.id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-gray-500">{typeLabel(p.isBusiness)}</span>
                  </div>
                  {p.featured && (
                    <span className="text-xs bg-yellow-400 text-white px-2 py-0.5 rounded">Sponsored</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">Categories</div>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goCategory(c.slug)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-gray-500">Category</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
