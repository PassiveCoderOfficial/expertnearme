import Link from "next/link";
import { ArrowRight, Shield, MapPin, Star, Users, CheckCircle, ChevronRight, CheckCircle2, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { LogoMark } from "@/components/Logo";
import FlagIcon from "@/components/FlagIcon";
import AdFeaturedExperts from "@/components/ads/AdFeaturedExperts";

export const dynamic = "force-dynamic";

export default async function GlobalHomePage() {
  let countries: { code: string; name: string; flagEmoji: string | null; metaDesc: string | null }[] = [];
  let expertCount = 0;
  let categoryCount = 0;
  let recentWork: {
    id: number; title: string; description: string | null; imageUrl: string | null; tags: string | null;
    expert: { name: string; businessName: string | null; profileLink: string | null; profilePicture: string | null; verified: boolean; countryCode: string | null; categories: { category: { name: string } }[] };
  }[] = [];

  try {
    const [countriesResult, expertCountResult, categoryCountResult, recentWorkResult] = await Promise.all([
      prisma.country.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { code: true, name: true, flagEmoji: true, metaDesc: true },
      }),
      prisma.expert.count(),
      prisma.category.count({ where: { active: true } }),
      prisma.completedWork.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          expert: {
            select: {
              name: true, businessName: true, profileLink: true,
              profilePicture: true, verified: true, countryCode: true,
              categories: { take: 1, include: { category: { select: { name: true } } } },
            },
          },
        },
      }),
    ]);

    countries = countriesResult;
    expertCount = expertCountResult;
    categoryCount = categoryCountResult;
    recentWork = recentWorkResult;
  } catch (err) {
    console.error("[Homepage] DB error:", err);
  }

  const stats = [
    { value: expertCount.toString(), label: "Verified Experts" },
    { value: countries.length.toString(), label: "Countries" },
    { value: categoryCount.toString(), label: "Categories" },
    { value: "Free", label: "To Browse" },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Pick Your Country",
      desc: "Select the country you're in or looking for experts in. We support multiple markets across Asia and the Middle East.",
    },
    {
      step: "02",
      title: "Browse or Search",
      desc: "Explore by category — IT, legal, health, MEP, and more — or search directly by name or service.",
    },
    {
      step: "03",
      title: "Contact & Hire",
      desc: "Every listing includes direct contact details. No middleman, no platform fees for buyers.",
    },
  ];

  const whyUs = [
    {
      icon: <Shield className="w-5 h-5 text-orange-500" />,
      title: "Manually Verified",
      desc: "Every expert on the platform is reviewed before going live. No ghost listings.",
    },
    {
      icon: <MapPin className="w-5 h-5 text-orange-500" />,
      title: "Truly Local",
      desc: "Country-specific categories and experts. Built for expats and locals who need someone nearby.",
    },
    {
      icon: <Star className="w-5 h-5 text-orange-500" />,
      title: "Reviewed by Clients",
      desc: "Real ratings from real bookings. Find the best-rated professionals in your area.",
    },
    {
      icon: <Users className="w-5 h-5 text-orange-500" />,
      title: "Free to Browse",
      desc: "Searching and contacting experts is always free. No sign-up required to browse listings.",
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-transparent dark:via-transparent dark:to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/5 dark:bg-orange-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <LogoMark size={16} />
            ExpertNear.Me
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight text-slate-900 dark:text-white">
            Find trusted experts,{" "}
            <span className="text-orange-500 dark:text-orange-400">country by country.</span>
          </h1>

          <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Verified local professionals across IT, legal, health, MEP and more —
            tailored for expats and locals in Asia &amp; the Middle East.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${countries[0]?.code || "bd"}`}
              className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-orange-500/20"
            >
              Find Experts Near You
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 hover:border-orange-400 dark:hover:border-orange-500/40 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white font-medium px-8 py-4 rounded-xl transition-colors text-base bg-white dark:bg-transparent shadow-sm dark:shadow-none"
            >
              List Your Business
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-3xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/8 shadow-sm dark:shadow-none">
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900/80 px-6 py-5 text-center border-r border-b border-slate-100 dark:border-white/8 last:border-r-0">
              <p className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-1">{s.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Countries ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 mb-1 font-semibold">Available Now</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse by Country</h2>
          </div>
        </div>

        {countries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-14 text-center text-slate-400 dark:text-slate-500 text-sm">
            No active countries yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={`/${country.code}`}
                className="group rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/40 hover:bg-orange-50 dark:hover:bg-slate-800/70 hover:border-orange-200 dark:hover:border-orange-500/30 p-6 transition-all shadow-sm dark:shadow-none flex items-center gap-4"
              >
                <span className="shrink-0"><FlagIcon countryCode={country.code} width={36} height={27} /></span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors mb-0.5">
                    {country.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {country.metaDesc || `Verified experts in ${country.name}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Simple Process</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/30 p-7 shadow-sm dark:shadow-none">
                <p className="text-4xl font-bold text-orange-400/40 dark:text-orange-500/30 mb-4 leading-none">{step.step}</p>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why ExpertNear.Me ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Why Us</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Built for Real Local Discovery</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/30 p-6 shadow-sm dark:shadow-none hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/15 flex items-center justify-center mb-4">
                {w.icon}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">{w.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sponsored Featured Experts ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <AdFeaturedExperts
          spot="HOME_FEATURED"
          title="Featured Experts"
          layout="grid"
        />
      </section>

      {/* ─── Completed Work Feed ──────────────────────────────────── */}
      {recentWork.length > 0 && (
        <section className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-orange-500 mb-1 font-semibold">Fresh from Experts</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Completed Work</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real projects, real results — updated as experts complete new work.</p>
              </div>
              <Link href="/completed-work" className="hidden sm:flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentWork.map((item) => {
                const displayName = item.expert.businessName || item.expert.name;
                const category = item.expert.categories[0]?.category.name;
                const profileHref = item.expert.countryCode && item.expert.profileLink
                  ? `/${item.expert.countryCode}/expert/${item.expert.profileLink}`
                  : null;

                return (
                  <div key={item.id} className="group rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 overflow-hidden hover:border-orange-200 dark:hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none flex flex-col">
                    {item.imageUrl ? (
                      <div className="w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-orange-500/10 to-amber-500/5 dark:from-orange-500/15 dark:to-amber-500/8 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-orange-400/30" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-2 line-clamp-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">{item.description}</p>
                      )}
                      {item.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.split(",").slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-500/15 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/6 flex items-center gap-2.5">
                        {item.expert.profilePicture ? (
                          <img src={item.expert.profilePicture} alt={displayName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {profileHref ? (
                            <Link href={profileHref} className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-500 transition-colors truncate block">{displayName}</Link>
                          ) : (
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{displayName}</p>
                          )}
                          {category && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{category}</p>}
                        </div>
                        {item.expert.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/completed-work" className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 font-semibold">
                View All Completed Work <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── For Experts CTA ──────────────────────────────────────── */}
      <section className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="rounded-2xl border border-orange-200 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-500/8 dark:to-amber-500/5 p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm dark:shadow-none">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">For Professionals</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Are you a local expert or business?</h3>
              <ul className="space-y-2">
                {[
                  "Get discovered by clients in your city",
                  "Verified badge builds instant trust",
                  "Founding Expert spots available now",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm whitespace-nowrap shadow-lg shadow-orange-500/20"
            >
              List Your Business →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
