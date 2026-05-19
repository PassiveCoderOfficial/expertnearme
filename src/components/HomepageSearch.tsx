'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

type CountryOption = { code: string; name: string };

export default function HomepageSearch({
  firstCountryCode,
  countries,
}: {
  firstCountryCode: string;
  countries: CountryOption[];
}) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState(firstCountryCode);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();

  const selected = countries.find(c => c.code === country) ?? countries[0];

  // Prefetch destination as user types so navigation is instant on submit
  useEffect(() => {
    const path = query.trim()
      ? `/${country}?search=${encodeURIComponent(query.trim())}`
      : `/${country}`;
    router.prefetch(path);
  }, [query, country, router]);

  // Prefetch on country change too
  useEffect(() => {
    router.prefetch(`/${country}`);
  }, [country, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/${country}?search=${encodeURIComponent(q)}`);
    } else {
      router.push(`/${country}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 shadow-lg shadow-slate-200/50 dark:shadow-none">
        {/* Country picker */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowPicker(v => !v)}
            className="h-full flex items-center gap-1.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap"
          >
            <span>{selected?.name ?? 'Country'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showPicker && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
              {countries.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCountry(c.code); setShowPicker(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    c.code === country
                      ? 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search experts, services, categories…"
          className="flex-1 px-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-transparent outline-none"
        />

        {/* Submit */}
        <button
          type="submit"
          className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white px-6 py-4 transition-colors flex items-center gap-2 font-semibold text-sm"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
