"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Globe, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import FlagIcon from "./FlagIcon";
import { setStoredCountry } from "./CountryPickerModal";

type CountryOption = { code: string; name: string; flagEmoji?: string };

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: "bd", name: "Bangladesh", flagEmoji: "🇧🇩" },
  { code: "ae", name: "UAE", flagEmoji: "🇦🇪" },
  { code: "sa", name: "Saudi Arabia", flagEmoji: "🇸🇦" },
  { code: "qa", name: "Qatar", flagEmoji: "🇶🇦" },
  { code: "om", name: "Oman", flagEmoji: "🇴🇲" },
  { code: "sg", name: "Singapore", flagEmoji: "🇸🇬" },
  { code: "my", name: "Malaysia", flagEmoji: "🇲🇾" },
];

const COUNTRY_CODES = new Set(FALLBACK_COUNTRIES.map((c) => c.code));

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>(FALLBACK_COUNTRIES);
  const [countryOpen, setCountryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { session, user, logout } = useAuth();

  const pathSegments = useMemo(() => (pathname || "/").split("/").filter(Boolean), [pathname]);
  const currentCode = COUNTRY_CODES.has(pathSegments[0] || "") ? pathSegments[0] : "";
  const currentCountry = countries.find((c) => c.code === currentCode);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((d: CountryOption[]) => { if (Array.isArray(d) && d.length > 0) setCountries(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); setCountryOpen(false); }, [pathname]);

  const go = (href: string) => { setOpen(false); router.push(href); };

  const changeCountry = (code: string) => {
    setStoredCountry(code);
    setCountryOpen(false);
    setOpen(false);
    if (!pathname || pathname === "/") { router.push(`/${code}`); return; }
    if (currentCode) {
      const [, ...rest] = pathSegments;
      const isDeep = rest.length > 1 || (rest.length === 1 && rest[0] !== "categories");
      if (isDeep) { router.push(`/${code}`); return; }
      router.push(`/${code}${rest.length ? `/${rest.join("/")}` : ""}`);
    } else {
      router.push(`/${code}`);
    }
  };

  const withCountry = (path: string) => `/${currentCode || "bd"}${path}`;

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Hamburger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/6 text-slate-700 dark:text-white hover:border-orange-300 dark:hover:border-orange-500/40 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div className="fixed top-16 left-0 right-0 mx-3 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden">
          <div className="p-4 space-y-1">

            {/* Country selector */}
            <div className="mb-3">
              <button
                onClick={() => setCountryOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-700 dark:text-white hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors"
              >
                <span className="shrink-0">
                  {currentCountry
                    ? <FlagIcon countryCode={currentCountry.code} width={20} height={15} />
                    : <Globe className="w-4 h-4 text-slate-400" />}
                </span>
                <span className="flex-1 text-left text-slate-600 dark:text-slate-300">
                  {currentCountry?.name || "Select Country"}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
              </button>

              {countryOpen && (
                <div className="mt-1 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-800 overflow-hidden">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => changeCountry(c.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        c.code === currentCode
                          ? "text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/8"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/6"
                      }`}
                    >
                      <FlagIcon countryCode={c.code} width={20} height={15} />
                      <span>{c.name}</span>
                      {c.code === currentCode && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/8 my-2" />

            {/* Nav links */}
            <button onClick={() => go(currentCode ? `/${currentCode}` : "/")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
              Home
            </button>
            <button onClick={() => go(withCountry("/categories"))} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
              Categories
            </button>
            <button onClick={() => go("/completed-work")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
              Job Done
            </button>
            <button onClick={() => go("/blog")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
              <BookOpen className="w-4 h-4 shrink-0" />
              Blog
            </button>
            <button onClick={() => go("/pricing")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 transition-all">
              Add Expert
            </button>

            <div className="h-px bg-slate-100 dark:bg-white/8 my-2" />

            {session?.authenticated ? (
              <>
                {/* User identity row */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.name ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : (user?.email?.charAt(0).toUpperCase() || '?')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'My Account'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.activeRole ? (user.activeRole.charAt(0) + user.activeRole.slice(1).toLowerCase()) : ''}</p>
                  </div>
                </div>
                <button onClick={() => go("/dashboard")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
                  Dashboard
                </button>
                <button onClick={() => go("/dashboard/profile")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
                  Edit Profile
                </button>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors">
                  Log In
                </button>
                <button
                  onClick={() => go("/signup")}
                  className="w-full text-center px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors mt-1 shadow-sm shadow-orange-500/20"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
