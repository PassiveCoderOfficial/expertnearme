'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Search } from 'lucide-react';
import FlagIcon from './FlagIcon';

type Country = { code: string; name: string; flagEmoji?: string };

const STORAGE_KEY = 'enm_country';

export function getStoredCountry(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredCountry(code: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, code);
}

export default function CountryPickerModal() {
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredCountry();
    if (stored) return;

    fetch('/api/countries')
      .then((r) => r.json())
      .then((data: Country[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const pick = (code: string) => {
    setStoredCountry(code);
    setOpen(false);
    router.push(`/${code}`);
  };

  const filtered = countries.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-orange-600/20 to-amber-500/10 border-b border-white/8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Welcome to ExpertNear.Me</h2>
                  <p className="text-slate-400 text-xs">Select your country to find local experts</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-white/8 rounded-xl px-3 py-2 focus-within:border-orange-500/40 transition-colors">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Country grid */}
            <div className="px-4 pb-5 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">No countries found.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {filtered.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => pick(c.code)}
                      className="flex items-center gap-3 bg-slate-800/60 hover:bg-orange-500/10 border border-white/6 hover:border-orange-500/30 rounded-xl px-4 py-3 transition-all group text-left"
                    >
                      <span className="shrink-0"><FlagIcon countryCode={c.code} width={24} height={18} /></span>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/8 px-6 py-3 text-center">
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip for now — browse all countries
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
