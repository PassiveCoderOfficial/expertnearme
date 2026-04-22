'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
import SearchBar from './SearchBar';
import MobileNav from './MobileNav';
import { useAuth } from '@/context/AuthContext';
import { LogoMark } from './Logo';
import { setStoredCountry } from './CountryPickerModal';
import FlagIcon from './FlagIcon';

type CountryOption = { code: string; name: string; flagEmoji?: string };

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: 'bd', name: 'Bangladesh', flagEmoji: '🇧🇩' },
  { code: 'ae', name: 'UAE', flagEmoji: '🇦🇪' },
  { code: 'sa', name: 'Saudi Arabia', flagEmoji: '🇸🇦' },
  { code: 'qa', name: 'Qatar', flagEmoji: '🇶🇦' },
  { code: 'om', name: 'Oman', flagEmoji: '🇴🇲' },
  { code: 'sg', name: 'Singapore', flagEmoji: '🇸🇬' },
  { code: 'my', name: 'Malaysia', flagEmoji: '🇲🇾' },
];

const GLOBAL_ROUTES = new Set([
  '', 'login', 'signup', 'dashboard', 'create-expert-account',
  'for-experts', 'pricing', 'founding-experts', 'search', 'verify',
]);

export default function Navbar() {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>(FALLBACK_COUNTRIES);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const pathSegments = useMemo(
    () => (pathname || '/').split('/').filter(Boolean),
    [pathname]
  );
  const currentCode = countries.find((c) => c.code === pathSegments[0])?.code || '';
  const currentCountry = countries.find((c) => c.code === currentCode);
  const hasCountryPrefix = !!currentCode;

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setCustomLogo(d.logo || null))
      .catch(() => {});

    fetch('/api/countries')
      .then((r) => r.json())
      .then((d: CountryOption[]) => {
        if (Array.isArray(d) && d.length > 0) setCountries(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const withCountry = (target: string) => {
    const cc = currentCode || 'bd';
    if (!target.startsWith('/')) return `/${cc}/${target}`;
    if (target === '/') return hasCountryPrefix ? `/${cc}` : '/';
    return `/${cc}${target}`;
  };

  const handleCountryChange = (next: string) => {
    setStoredCountry(next);
    setDropdownOpen(false);
    if (!pathname || pathname === '/') { router.push(`/${next}`); return; }
    if (hasCountryPrefix) {
      const [, ...rest] = pathSegments;
      router.push(`/${next}${rest.length ? `/${rest.join('/')}` : ''}`);
      return;
    }
    if (GLOBAL_ROUTES.has(pathSegments[0] || '')) { router.push(`/${next}`); return; }
    router.push(`/${next}/${pathSegments.join('/')}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {customLogo ? (
            <img src={customLogo} alt="ExpertNear.Me" className="h-9 w-auto" />
          ) : (
            <>
              <LogoMark size={30} />
              <span className="text-base font-bold text-white tracking-tight hidden sm:inline">
                <span className="text-orange-400">Expert</span>Near.Me
              </span>
            </>
          )}
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-5">
          {/* Country picker */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-9 rounded-lg border border-white/15 bg-white/6 px-3 text-sm text-white hover:border-orange-500/40 transition-colors"
            >
              <span className="flex items-center">
                {currentCountry ? <FlagIcon countryCode={currentCountry.code} width={20} height={15} /> : <Globe className="w-4 h-4 text-slate-400" />}
              </span>
              <span className="text-slate-300 max-w-[80px] truncate">
                {currentCountry?.name || 'Country'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/6 ${
                      c.code === currentCode
                        ? 'text-orange-300 bg-orange-500/8'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="shrink-0"><FlagIcon countryCode={c.code} width={20} height={15} /></span>
                    <span className="truncate">{c.name}</span>
                    {c.code === currentCode && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium text-slate-300">
            <Link
              href={hasCountryPrefix ? `/${currentCode}` : '/'}
              className="hover:text-white transition-colors"
            >
              Find Experts
            </Link>
            <Link href={withCountry('/categories')} className="hover:text-white transition-colors">
              Categories
            </Link>
            <Link
              href="/for-experts"
              className="text-orange-400 hover:text-orange-300 transition-colors font-semibold"
            >
              List Your Business
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-56">
            <SearchBar currentCountry={currentCode || 'bd'} />
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
