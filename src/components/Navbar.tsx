"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "./Logo";

type CountryOption = { code: string; name: string };

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: "bd", name: "Bangladesh" },
  { code: "ae", name: "UAE" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "qa", name: "Qatar" },
  { code: "om", name: "Oman" },
  { code: "sg", name: "Singapore" },
  { code: "my", name: "Malaysia" },
];

const GLOBAL_ROUTES = new Set(["", "login", "signup", "dashboard", "create-expert-account", "for-experts", "pricing", "founding-experts", "search", "verify"]);

export default function Navbar() {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>(FALLBACK_COUNTRIES);
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const pathSegments = useMemo(() => (pathname || "/").split("/").filter(Boolean), [pathname]);
  const currentCountry = countries.find((c) => c.code === pathSegments[0])?.code || "bd";
  const hasCountryPrefix = !!countries.find((c) => c.code === pathSegments[0]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setCustomLogo(d.logo || null))
      .catch(() => {});

    fetch("/api/dashboard/countries")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0)
          setCountries(d.filter((c) => c.active !== false).map((c) => ({ code: c.code, name: c.name })));
      })
      .catch(() => {});
  }, []);

  const withCountry = (target: string) => {
    if (!target.startsWith("/")) return `/${currentCountry}/${target}`;
    if (target === "/") return hasCountryPrefix ? `/${currentCountry}` : "/";
    return `/${currentCountry}${target}`;
  };

  const handleCountryChange = (next: string) => {
    if (!pathname || pathname === "/") { router.push(`/${next}`); return; }
    if (hasCountryPrefix) {
      const [, ...rest] = pathSegments;
      router.push(`/${next}${rest.length ? `/${rest.join("/")}` : ""}`);
      return;
    }
    if (GLOBAL_ROUTES.has(pathSegments[0] || "")) { router.push(`/${next}`); return; }
    router.push(`/${next}/${pathSegments.join("/")}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {customLogo ? (
            <img src={customLogo} alt="ExpertNear.Me" className="h-9 w-auto" />
          ) : (
            <>
              <LogoMark size={30} />
              <span className="text-base font-bold text-white tracking-tight hidden sm:inline">
                ExpertNear<span className="text-orange-400">.Me</span>
              </span>
            </>
          )}
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-5">
          <select
            value={currentCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="h-9 rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-white outline-none hover:border-orange-500/40 transition-colors cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code} className="text-black bg-white">
                {c.name}
              </option>
            ))}
          </select>

          <nav className="flex items-center gap-5 text-sm font-medium text-slate-300">
            <Link href={hasCountryPrefix ? `/${currentCountry}` : "/"} className="hover:text-white transition-colors">
              Find Experts
            </Link>
            <Link href={withCountry("/categories")} className="hover:text-white transition-colors">
              Categories
            </Link>
            <Link href="/for-experts" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">
              List Your Business
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-56">
            <SearchBar currentCountry={currentCountry} />
          </div>
          {session?.authenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-slate-900 px-4 py-1.5 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
