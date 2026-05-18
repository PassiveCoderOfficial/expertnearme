import Link from "next/link";
import { Shield, MapPin, Star, Users, ArrowRight, CheckCircle, Globe, Zap } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ExpertNear.Me — Local Expert Directory for Asia & Middle East",
  description: "ExpertNear.Me connects buyers with verified local experts across Asia and the Middle East. Learn about our mission, how we verify experts, and why we built this platform.",
};

const values = [
  {
    icon: Shield,
    title: "Verified, Not Just Listed",
    desc: "Every expert is manually reviewed before going live. No ghost listings, no unverified profiles. If they're on ExpertNear.Me, they're real.",
  },
  {
    icon: MapPin,
    title: "Built for Local Markets",
    desc: "Country-specific categories, local payment methods, and experts who actually know the ground rules where you live and work.",
  },
  {
    icon: Star,
    title: "Trust Through Transparency",
    desc: "Reviews come from real bookings. Ratings are earned, not bought. We don't inflate or suppress feedback.",
  },
  {
    icon: Globe,
    title: "Multi-Country by Design",
    desc: "Not an afterthought. The platform was built from day one to serve multiple countries with their own experts, categories, and dynamics.",
  },
];

const milestones = [
  { year: "2025", label: "Platform built", desc: "Core platform developed — expert listings, bookings, reviews, messaging, ads system." },
  { year: "2026", label: "Founding Expert campaign", desc: "500 founding spots opened to early experts before public launch." },
  { year: "Aug 2026", label: "Global launch", desc: "Public launch across Bangladesh, UAE, Saudi Arabia, Singapore, and more." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-20 px-6 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-transparent dark:via-transparent dark:to-transparent border-b border-slate-100 dark:border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 dark:bg-orange-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <LogoMark size={16} />
            Our Story
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight text-slate-900 dark:text-white">
            Finding a local expert{" "}
            <span className="text-orange-500 dark:text-orange-400">shouldn't be hard.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            ExpertNear.Me was built because finding a qualified, trustworthy local professional in Asia and the Middle East is harder than it should be. No reliable directory, no verified listings — just word of mouth and luck.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 mb-3 font-semibold">Our Mission</p>
            <h2 className="text-3xl font-bold mb-5 text-slate-900 dark:text-white">
              Make local expertise discoverable — everywhere.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              We're building the go-to platform for finding verified local professionals across emerging markets. Whether you're an expat needing a local lawyer, a startup looking for a tech consultant, or a homeowner searching for an MEP contractor — ExpertNear.Me gives you a verified, reviewed, contactable expert.
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              No subscription required to browse. No middleman. Direct contact with experts who've been verified by our team.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Free to search and browse — always",
              "Experts verified before listing",
              "Real reviews from real bookings",
              "Local categories per country",
              "Direct contact — no platform middleman",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/8 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">What We Stand For</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/30 p-6 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/15 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">{v.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Timeline</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Where We Are</h2>
        </div>
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <div key={m.year} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                  i === milestones.length - 1
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                {i < milestones.length - 1 && <div className="w-px flex-1 mt-2 bg-slate-200 dark:bg-white/8" />}
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest">{m.year}</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-sm">{m.label}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Be part of what we're building.</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Founding Expert spots are open until August 15, 2026. Lock in lifetime access before launch and get your name in our Hall of Fame.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              Claim Founding Expert Spot
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-orange-400 dark:hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-white font-medium px-8 py-4 rounded-xl transition-colors"
            >
              Browse Experts
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
