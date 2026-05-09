'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Globe, Menu, BookOpen, Lightbulb, TrendingUp, Users } from 'lucide-react';
import SearchBar from './SearchBar';
import MobileNav from './MobileNav';
import { useAuth } from '@/context/AuthContext';
import { LogoMark } from './Logo';
import { setStoredCountry } from './CountryPickerModal';
import FlagIcon from './FlagIcon';
import { ThemeToggle } from './ThemeToggle';

const BLOG_CATEGORIES = [
  { label: 'Expert Guides', href: '/blog?category=expert-guides', icon: Lightbulb },
  { label: 'Industry Trends', href: '/blog?category=industry-trends', icon: TrendingUp },
  { label: 'Success Stories', href: '/blog?category=success-stories', icon: Users },
];

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
  'completed-work', 'support', 'blog',
]);

export default function Navbar() {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>(FALLBACK_COUNTRIES);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
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
      if (blogRef.current && !blogRef.current.contains(e.target as Node)) {
        setBlogOpen(false);
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
      // Deep routes (expert profiles, category detail pages) don't exist cross-country — go to homepage
      const isDeep = rest.length > 1 || (rest.length === 1 && rest[0] !== 'categories');
      if (isDeep) { router.push(`/${next}`); return; }
      router.push(`/${next}${rest.length ? `/${rest.join('/')}` : ''}`);
      return;
    }
    if (GLOBAL_ROUTES.has(pathSegments[0] || '')) { router.push(`/${next}`); return; }
    router.push(`/${next}/${pathSegments.join('/')}`);
  };

  const isDashboard = pathname?.startsWith('/dashboard');

  const openDashboardSidebar = () => {
    document.dispatchEvent(new CustomEvent('toggle-dashboard-sidebar'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/8">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Left: dashboard toggle (mobile only) + logo */}
        <div className="flex items-center gap-2 shrink-0">
          {isDashboard && (
            <button
              onClick={openDashboardSidebar}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              aria-label="Open dashboard menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-1.5">
            {customLogo ? (
              <img src={customLogo} alt="ExpertNear.Me" className="h-9 w-auto" />
            ) : (
              <>
                <LogoMark size={30} />
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  <span className="text-orange-500">Expert</span>Near.Me
                </span>
              </>
            )}
          </Link>
        </div>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-5">
          {/* Country picker */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-9 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/6 px-3 text-sm text-slate-700 dark:text-white hover:border-orange-400 dark:hover:border-orange-500/40 transition-colors"
            >
              <span className="flex items-center">
                {currentCountry ? <FlagIcon countryCode={currentCountry.code} width={20} height={15} /> : <Globe className="w-4 h-4 text-slate-400" />}
              </span>
              <span className="text-slate-600 dark:text-slate-300 max-w-[80px] truncate">
                {currentCountry?.name || 'Country'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-xl shadow-xl dark:shadow-2xl z-50 py-1.5 overflow-hidden">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/6 ${
                      c.code === currentCode
                        ? 'text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/8'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="shrink-0"><FlagIcon countryCode={c.code} width={20} height={15} /></span>
                    <span className="truncate">{c.name}</span>
                    {c.code === currentCode && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              href={hasCountryPrefix ? `/${currentCode}` : '/'}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link href={withCountry('/categories')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Categories
            </Link>
            <Link href="/completed-work" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Job Done
            </Link>

            {/* Blog dropdown */}
            <div ref={blogRef} className="relative">
              <button
                onClick={() => setBlogOpen((v) => !v)}
                onMouseEnter={() => setBlogOpen(true)}
                className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Blog
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-150 ${blogOpen ? 'rotate-180' : ''}`} />
              </button>

              {blogOpen && (
                <div
                  onMouseLeave={() => setBlogOpen(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-50 py-2 overflow-hidden"
                >
                  <Link
                    href="/blog"
                    onClick={() => setBlogOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>All Articles</span>
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-white/8 mx-3 my-1" />
                  {BLOG_CATEGORIES.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setBlogOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/6 transition-colors"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className="text-white font-semibold px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 transition-all shadow-sm shadow-orange-500/20"
            >
              Add Expert
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <div className="w-56">
            <SearchBar currentCountry={currentCode || 'bd'} />
          </div>
          {session?.authenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded-lg transition-colors shadow-sm shadow-orange-500/20"
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
