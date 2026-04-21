import { Crown, Globe, Star, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Founding Experts — ExpertNear.Me',
  description:
    'The original 500 experts who believed in ExpertNear.Me before it launched. Honored permanently.',
};

async function getFoundingExperts() {
  return prisma.expert.findMany({
    where: { foundingExpert: true },
    select: {
      id: true,
      name: true,
      businessName: true,
      profileLink: true,
      countryCode: true,
      profilePicture: true,
      shortDesc: true,
      foundingExpertSince: true,
      categories: {
        take: 1,
        include: { category: { select: { name: true } } },
      },
    },
    orderBy: { foundingExpertSince: 'asc' },
  });
}

async function getSpotStats() {
  const taken = await prisma.expert.count({ where: { foundingExpert: true } });
  return { taken, total: 500 };
}

const COUNTRY_FLAGS: Record<string, string> = {
  sg: '🇸🇬',
  uae: '🇦🇪',
  ae: '🇦🇪',
  sa: '🇸🇦',
  bd: '🇧🇩',
  my: '🇲🇾',
  th: '🇹🇭',
  iq: '🇮🇶',
  qa: '🇶🇦',
};

const COUNTRY_NAMES: Record<string, string> = {
  sg: 'Singapore',
  uae: 'UAE',
  ae: 'UAE',
  sa: 'Saudi Arabia',
  bd: 'Bangladesh',
  my: 'Malaysia',
  th: 'Thailand',
  iq: 'Iraq',
  qa: 'Qatar',
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default async function FoundingExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const [experts, stats, sp] = await Promise.all([
    getFoundingExperts(),
    getSpotStats(),
    searchParams,
  ]);
  const isWelcome = sp.welcome === '1';
  const spotsLeft = stats.total - stats.taken;
  const stillOpen = new Date() < new Date('2026-08-15T23:59:59');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Welcome banner — shown after LS payment redirect */}
      {isWelcome && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Payment confirmed — you're a Founding Expert!</p>
                <p className="text-xs text-slate-800">Now complete your profile so clients can find you on launch day.</p>
              </div>
            </div>
            <Link
              href="/create-expert-account?founding=1"
              className="flex items-center gap-2 bg-slate-900 text-orange-400 font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Complete Your Profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-orange-400 font-bold text-lg tracking-tight">
            ExpertNear.Me
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Find Experts
            </Link>
            <Link href="/for-experts" className="text-slate-400 hover:text-white transition-colors">
              For Experts
            </Link>
            {stillOpen && (
              <Link
                href="/for-experts#pricing"
                className="bg-orange-500 hover:bg-orange-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Claim Spot
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <Crown className="h-12 w-12 text-orange-400 mx-auto mb-5" />
        <h1 className="text-5xl font-bold mb-4">Founding Experts</h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
          These are the{' '}
          <strong className="text-white">{stats.taken} experts</strong> who believed in ExpertNear.Me
          before it launched. They took the leap early — and they&apos;re honored here, permanently.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
          <span>
            <strong className="text-orange-400 text-2xl font-bold block">{stats.taken}</strong>
            Founding Experts
          </span>
          <span>
            <strong className="text-orange-400 text-2xl font-bold block">{stats.total}</strong>
            Maximum Spots
          </span>
          <span>
            <strong className="text-orange-400 text-2xl font-bold block">Aug 16</strong>
            Platform Launch
          </span>
        </div>

        {stillOpen && spotsLeft > 0 && (
          <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl px-6 py-4">
            <p className="text-orange-300 text-sm">
              <strong>{spotsLeft} spots</strong> still available until August 15, 2026
            </p>
            <Link
              href="/for-experts#pricing"
              className="bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 font-bold text-sm px-5 py-2 rounded-xl hover:from-orange-400 hover:to-amber-300 transition-all whitespace-nowrap"
            >
              Claim Your Spot →
            </Link>
          </div>
        )}
      </section>

      {/* Expert grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {experts.length === 0 ? (
          /* Empty state — shown pre-launch */
          <div className="text-center py-20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10 opacity-40 pointer-events-none select-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 mx-auto mb-3" />
                  <div className="h-3 bg-slate-700 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-2 bg-slate-700 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-lg mb-2">No founding experts yet — be the first.</p>
            {stillOpen && (
              <Link
                href="/for-experts#pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl mt-4 hover:from-orange-400 hover:to-amber-300 transition-all"
              >
                <Crown className="h-4 w-4" />
                Claim Founding Expert Spot
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {experts.map((expert, index) => {
              const flag = expert.countryCode ? COUNTRY_FLAGS[expert.countryCode.toLowerCase()] : '🌍';
              const countryName = expert.countryCode
                ? COUNTRY_NAMES[expert.countryCode.toLowerCase()] ?? expert.countryCode.toUpperCase()
                : 'Global';
              const category = expert.categories[0]?.category?.name ?? 'Expert';
              const displayName = expert.businessName || expert.name;
              const profileUrl = expert.countryCode && expert.profileLink
                ? `/${expert.countryCode}/expert/${expert.profileLink}`
                : null;

              return (
                <div
                  key={expert.id}
                  className="rounded-2xl border border-white/8 bg-slate-800/50 p-5 hover:border-orange-500/30 hover:bg-slate-800/70 transition-colors group"
                >
                  {/* Number badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-xs text-slate-500 font-mono">#{String(index + 1).padStart(3, '0')}</div>
                    <span className="inline-flex items-center gap-1 bg-orange-500/15 text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-500/25">
                      <Crown className="h-2.5 w-2.5" />
                      Founding
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-3">
                    {expert.profilePicture ? (
                      <img
                        src={expert.profilePicture}
                        alt={displayName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold shrink-0">
                        {initials(displayName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{displayName}</p>
                      <p className="text-xs text-orange-300 truncate">{category}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <p className="text-xs text-slate-400 mb-3">
                    <Globe className="inline h-3 w-3 mr-1 text-slate-500" />
                    {flag} {countryName}
                  </p>

                  {/* Desc */}
                  {expert.shortDesc && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{expert.shortDesc}</p>
                  )}

                  {/* Profile link */}
                  {profileUrl && (
                    <Link
                      href={profileUrl}
                      className="block text-center text-xs font-medium text-orange-400 hover:text-orange-300 border border-orange-500/20 hover:border-orange-500/40 rounded-lg py-1.5 transition-colors"
                    >
                      View Profile →
                    </Link>
                  )}
                </div>
              );
            })}

            {/* "Your spot" placeholder card while spots remain */}
            {stillOpen && spotsLeft > 0 && (
              <Link
                href="/for-experts#pricing"
                className="rounded-2xl border-2 border-dashed border-orange-500/30 bg-orange-500/5 p-5 flex flex-col items-center justify-center text-center hover:border-orange-500/50 hover:bg-orange-500/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-orange-500/40 flex items-center justify-center mb-3 group-hover:border-orange-400 transition-colors">
                  <Crown className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-sm font-semibold text-orange-300">Your spot?</p>
                <p className="text-xs text-slate-500 mt-1">{spotsLeft} remaining</p>
                <p className="text-xs text-orange-400 mt-3 font-medium">Claim it →</p>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>
            <span className="text-orange-400 font-bold mr-1">ExpertNear.Me</span>
            © {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-slate-300 transition-colors">Find Experts</Link>
            <Link href="/for-experts" className="hover:text-slate-300 transition-colors">For Experts</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
