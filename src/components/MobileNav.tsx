"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
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
  const { session, logout } = useAuth();

  const pathSegments = useMemo(() => (pathname || "/").split("/").filter(Boolean), [pathname]);
  const currentCode = COUNTRY_CODES.has(pathSegments[0] || "") ? pathSegments[0] : "";
  const currentCountry = countries.find((c) => c.code === currentCode);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((d: CountryOption[]) => { if (Array.isArray(d) && d.length > 0) setCountries(d); })
      .catch(() => {});
  }, []);

  // Close on outside click
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

  // Close on route change
  useEffect(() => { setOpen(false); setCountryOpen(false); }, [pathname]);

  const go = (href: string) => { setOpen(false); router.push(href); };

  const changeCountry = (code: string) => {
    setStoredCountry(code);
    setCountryOpen(false);
    setOpen(false);
    if (!pathname || pathname === "/") { router.push(`/${code}`); return; }
    if (currentCode) {
      const [, ...rest] = pathSegments;
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
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/15 bg-white/6 text-white hover:border-orange-500/40 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div className="fixed top-16 left-0 right-0 mx-3 z-50 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-4 space-y-1">

            {/* Country selector */}
            <div className="mb-3">
              <button
                onClick={() => setCountryOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 bg-slate-800/60 text-sm text-white hover:border-orange-500/30 transition-colors"
              >
                <span className="shrink-0">
                  {currentCountry
                    ? <FlagIcon countryCode={currentCountry.code} width={20} height={15} />
                    : <Globe className="w-4 h-4 text-slate-400" />}
                </span>
                <span className="flex-1 text-left text-slate-300">
                  {currentCountry?.name || "Select Country"}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
              </button>

              {countryOpen && (
                <div className="mt-1 rounded-xl border border-white/10 bg-slate-800 overflow-hidden">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => changeCountry(c.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/6 ${
                        c.code === currentCode ? "text-orange-300 bg-orange-500/8" : "text-slate-300"
                      }`}
                    >
                      <FlagIcon countryCode={c.code} width={20} height={15} />
                      <span>{c.name}</span>
                      {c.code === currentCode && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-white/8 my-2" />

            {/* Nav links */}
            <button onClick={() => go(currentCode ? `/${currentCode}` : "/")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
              Find Experts
            </button>
            <button onClick={() => go(withCountry("/categories"))} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
              Categories
            </button>
            <button onClick={() => go("/pricing")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/8 transition-colors">
              List Your Business
            </button>

            <div className="h-px bg-white/8 my-2" />

            {session?.authenticated ? (
              <>
                <button onClick={() => go("/dashboard")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
                  Dashboard
                </button>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-colors">
                  Log In
                </button>
                <button
                  onClick={() => go("/signup")}
                  className="w-full text-center px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-slate-900 transition-colors mt-1"
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
