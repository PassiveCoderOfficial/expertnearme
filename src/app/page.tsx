import Link from "next/link";
import { ArrowRight, Shield, MapPin, Star, Users, CheckCircle, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { LogoMark } from "@/components/Logo";
import WorldMap, { COUNTRY_CENTROIDS, CountryPin } from "@/components/WorldMap";
import FlagIcon from "@/components/FlagIcon";

export const dynamic = "force-dynamic";

export default async function GlobalHomePage() {
  const [countries, expertCount, categoryCount, expertsByCountry] = await Promise.all([
    prisma.country.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { code: true, name: true, flagEmoji: true, metaDesc: true },
    }),
    prisma.expert.count({ where: { verified: true } }),
    prisma.category.count({ where: { active: true } }),
    prisma.expert.groupBy({ by: ["countryCode"], _count: { id: true }, where: { verified: true } }),
  ]);

  const expertCountByCode = Object.fromEntries(
    expertsByCountry.map(r => [r.countryCode, r._count.id])
  );

  const countryPins: CountryPin[] = countries
    .filter(c => COUNTRY_CENTROIDS[c.code])
    .map(c => ({
      code:        c.code,
      name:        c.name,
      flagEmoji:   c.flagEmoji || undefined,
      lat:         COUNTRY_CENTROIDS[c.code].lat,
      lng:         COUNTRY_CENTROIDS[c.code].lng,
      expertCount: expertCountByCode[c.code] || 0,
    }));

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
      icon: <Shield className="w-5 h-5 text-orange-400" />,
      title: "Manually Verified",
      desc: "Every expert on the platform is reviewed before going live. No ghost listings.",
    },
    {
      icon: <MapPin className="w-5 h-5 text-orange-400" />,
      title: "Truly Local",
      desc: "Country-specific categories and experts. Built for expats and locals who need someone nearby.",
    },
    {
      icon: <Star className="w-5 h-5 text-orange-400" />,
      title: "Reviewed by Clients",
      desc: "Real ratings from real bookings. Find the best-rated professionals in your area.",
    },
    {
      icon: <Users className="w-5 h-5 text-orange-400" />,
      title: "Free to Browse",
      desc: "Searching and contacting experts is always free. No sign-up required to browse listings.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <LogoMark size={16} />
            ExpertNear.Me
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
              href="/for-experts"
              className="inline-flex items-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-colors text-base"
            >
              List Your Business
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-3xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-900/80 px-6 py-5 text-center">
              <p className="text-2xl font-bold text-orange-400 mb-1">{s.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── World Map ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-6">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-orange-400 mb-1">We&apos;re Live In</p>
          <h2 className="text-2xl font-bold text-white">Find Experts on the Map</h2>
          <p className="text-slate-400 text-sm mt-1">Click any pin to browse experts in that country</p>
        </div>
        <WorldMap countries={countryPins} className="h-[420px] sm:h-[520px]" />
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
        )}
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
              href="/for-experts"
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
            <Link href="/for-experts" className="hover:text-slate-400 transition-colors">For Experts</Link>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-slate-400 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
