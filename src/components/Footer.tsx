import Link from 'next/link';
import { LogoMark } from './Logo';
import { Globe, Twitter, Linkedin, Facebook, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Find Experts', href: '/' },
    { label: 'Browse Categories', href: '/bd/categories' },
    { label: 'How It Works', href: '/for-experts' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Founding Expert Deal', href: '/founding-experts' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Press', href: '/press' },
  ],
  'For Experts': [
    { label: 'List Your Business', href: '/create-expert-account' },
    { label: 'Expert Dashboard', href: '/dashboard' },
    { label: 'Subscription Plans', href: '/pricing' },
    { label: 'Success Stories', href: '/blog?category=success-stories' },
    { label: 'Expert Resources', href: '/blog?category=expert-guides' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refunds' },
  ],
};

const SOCIAL = [
  { label: 'Twitter', href: 'https://twitter.com/expertnearme', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/expertnearme', icon: Linkedin },
  { label: 'Facebook', href: 'https://facebook.com/expertnearme', icon: Facebook },
];

const TOP_COUNTRIES = [
  { code: 'bd', name: 'Bangladesh' },
  { code: 'ae', name: 'UAE' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'my', name: 'Malaysia' },
  { code: 'qa', name: 'Qatar' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/8 mt-auto">
      {/* CTA strip */}
      <div className="border-b border-white/8 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-lg">Ready to grow your business?</p>
            <p className="text-slate-400 text-sm mt-0.5">Join 500+ experts on ExpertNear.Me — founding deal ends Aug 15, 2026.</p>
          </div>
          <Link
            href="/create-expert-account"
            className="shrink-0 bg-orange-500 hover:bg-orange-400 text-slate-900 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
          >
            Get Listed Free
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoMark size={28} />
              <span className="text-base font-bold text-white">
                <span className="text-orange-400">Expert</span>Near.Me
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The global directory connecting buyers with verified local experts — by country, by category, by trust.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/25 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
              <a
                href="mailto:hello@expertnear.me"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/25 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <p className="text-white font-semibold text-sm">{title}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Countries */}
        <div className="mt-10 pt-8 border-t border-white/8">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Available Countries
          </p>
          <div className="flex flex-wrap gap-2">
            {TOP_COUNTRIES.map(({ code, name }) => (
              <Link
                key={code}
                href={`/${code}`}
                className="text-xs text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg px-3 py-1.5 transition-colors"
              >
                {name}
              </Link>
            ))}
            <Link
              href="/"
              className="text-xs text-orange-400 hover:text-orange-300 bg-orange-500/8 border border-orange-500/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              + More Countries
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {year} ExpertNear.Me. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
