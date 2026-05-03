// src/app/page.tsx
import { prisma } from "@/lib/db";
import { LogoMark } from "@/components/Logo";
import FlagIcon from "@/components/FlagIcon";

export const dynamic = 'force-dynamic';

export default async function GlobalHomePage() {
  let countries: { code: string; name: string; flagEmoji: string | null; metaDesc: string | null }[] = [];
  let expertCount = 0;
  let categoryCount = 0;

  try {
    const [countriesResult, expertCountResult, categoryCountResult] = await Promise.all([
      prisma.country.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { code: true, name: true, flagEmoji: true, metaDesc: true },
      }),
      prisma.expert.count(),
      prisma.category.count({ where: { active: true } }),
    ]);

    countries = countriesResult;
    expertCount = expertCountResult;
    categoryCount = categoryCountResult;
  } catch (err) {
    console.error("[Homepage] DB error:", err);
  }

    // Transform providers data for the map
    const mapProviders = providers.map(expert => {
      const category = expert.categories[0]?.category;
      return {
        id: expert.id,
        name: expert.name,
        latitude: expert.latitude || 0,
        longitude: expert.longitude || 0,
        phone: expert.phone,
        category: category || {
          id: 0,
          name: 'Uncategorized',
          slug: 'uncategorized',
          color: '#666666'
        }
      };
    }).filter(provider => provider.latitude && provider.longitude);

    return (
      <main>
        <MobileFirstHero onScrollTo="categories" />

        {/* Interactive Map Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Experts Near You</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore verified professionals in your area. Click on pins to view details, or filter by category.
            </p>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Find trusted experts,{" "}
            <span className="text-orange-400">country by country.</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Verified local professionals across IT, legal, health, MEP and more —
            tailored for expats and locals in Asia &amp; the Middle East.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${countries[0]?.code || "bd"}`}
              className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors text-base"
            >
              Find Experts Near You
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-colors text-base"
            >
              List Your Business
            </Link>
          </div>
        </section>

        {/* Category Showcase */}
        <section id="categories" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Categories</h2>
          <MobileFirstCategoryGrid 
            categories={categories} 
            countryCode="bd" 
          />
        </section>

      {/* ─── Countries ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-400 mb-1">Available Now</p>
            <h2 className="text-2xl font-bold text-white">Browse by Country</h2>
          </div>
        </div>

        {countries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center text-slate-500 text-sm">
            No active countries yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={`/${country.code}`}
                className="group rounded-2xl border border-white/8 bg-slate-800/40 hover:bg-slate-800/70 hover:border-orange-500/30 p-6 transition-colors flex items-center gap-4"
              >
                <span className="shrink-0"><FlagIcon countryCode={country.code} width={36} height={27} /></span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors mb-0.5">
                    {country.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {country.metaDesc || `Verified experts in ${country.name}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-orange-400 mb-2">Simple Process</p>
            <h2 className="text-2xl font-bold text-white">How It Works</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="rounded-2xl border border-white/8 bg-slate-800/30 p-7">
                <p className="text-4xl font-bold text-orange-500/30 mb-4 leading-none">{step.step}</p>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why ExpertNear.Me ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-orange-400 mb-2">Why Us</p>
          <h2 className="text-2xl font-bold text-white">Built for Real Local Discovery</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-2xl border border-white/8 bg-slate-800/30 p-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center mb-4">
                {w.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{w.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── For Experts CTA ──────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/8 to-amber-500/5 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-400 mb-2">For Professionals</p>
              <h3 className="text-2xl font-bold text-white mb-3">Are you a local expert or business?</h3>
              <ul className="space-y-2">
                {[
                  "Get discovered by clients in your city",
                  "Verified badge builds instant trust",
                  "Founding Expert spots available now",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              List Your Business →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <LogoMark size={18} />
            <span>ExpertNear.Me — Local Expert Directory</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">For Experts</Link>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-slate-400 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
