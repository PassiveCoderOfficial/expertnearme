'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Globe, Search, MessageCircle, BarChart3,
  ImageIcon, Users, ChevronDown, Crown, Zap, Shield, MapPin,
  Star, CheckCircle, Layers
} from 'lucide-react';
import PricingTable from '@/components/PricingTable';

const BENEFITS = [
  {
    icon: Globe,
    title: 'Country-Specific Discovery',
    body: 'Clients in Singapore, UAE, Bangladesh, and Saudi Arabia search for exactly what you offer — in their own country, language, and context.',
  },
  {
    icon: Search,
    title: 'Priority Search Placement',
    body: 'Pro and Founding Expert profiles appear above standard listings. Be the first name clients see when they search your category.',
  },
  {
    icon: MessageCircle,
    title: 'Direct WhatsApp Leads',
    body: 'One-tap WhatsApp button on your profile. Clients reach you instantly — no gatekeeping, no commission, no middleman.',
  },
  {
    icon: ImageIcon,
    title: 'Portfolio Showcase',
    body: 'Upload photos, videos, and project samples. Show your work before clients even reach out — and let quality speak for itself.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    body: "Track profile views, contact clicks, and search impressions. Know what's working and where your leads are coming from.",
  },
  {
    icon: Layers,
    title: 'Shape the Platform',
    body: "Founding Experts get direct input on product features, categories, and roadmap. You're not just a user — you're a co-builder.",
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create your profile',
    body: 'Add your name, business, categories, services, portfolio, and contact details. Takes about 10 minutes.',
  },
  {
    number: '02',
    title: 'Get discovered locally',
    body: 'Your profile appears in country-specific search results and category pages where clients are actively looking.',
  },
  {
    number: '03',
    title: 'Receive leads & grow',
    body: 'Clients contact you directly via WhatsApp, phone, or the built-in contact form. No commissions, ever.',
  },
];

const FAQS = [
  {
    q: 'How long does it take to set up my profile?',
    a: "About 10 minutes. Add your name, bio, category, contact info, and some portfolio photos — and you're live immediately.",
  },
  {
    q: 'Which countries are supported at launch?',
    a: 'Singapore, UAE, Bangladesh, and Saudi Arabia on launch day (August 16, 2026). More countries are added regularly via the admin dashboard.',
  },
  {
    q: 'What happens to the lifetime deal after August 15, 2026?',
    a: 'The deal closes permanently on August 15 at midnight. Pro subscriptions open at $49/month or $299/year on launch day. No exceptions — no extensions.',
  },
  {
    q: 'What is the Founding Experts page?',
    a: 'A permanent, dedicated page on ExpertNear.Me honoring everyone who joined before the platform launched. Your name, profile link, and category — listed forever as one of the original 500 founders.',
  },
  {
    q: 'Can I upgrade from Free to Pro after launch?',
    a: 'Yes. When Pro launches on August 16, you can upgrade at any time directly from your dashboard.',
  },
  {
    q: 'Is there a refund on the lifetime deal?',
    a: "Yes — 30-day money-back guarantee, no questions asked. If you're not satisfied within 30 days of purchase, we'll refund you in full.",
  },
  {
    q: 'Do I need technical skills to manage my profile?',
    a: 'None at all. The dashboard is designed for business owners, not developers. If you can fill out a form, you can manage your expert profile.',
  },
];

const STATS = [
  { value: '5', label: 'Countries at launch' },
  { value: '50+', label: 'Expert categories' },
  { value: 'Aug 16', label: 'Launch date' },
  { value: '500', label: 'Founding spots only' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 text-orange-300 text-sm font-medium mb-7">
            <Crown className="h-4 w-4" />
            Pre-Launch · Founding Expert spots available
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            List your expertise.
            <br />
            <span className="text-orange-400">Get found. Grow locally.</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            ExpertNear.Me connects clients with trusted local experts across Asia and the Middle East.
            Create your profile free — or secure lifetime access before we launch on August 16, 2026.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#pricing"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-900 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 group"
            >
              <Crown className="h-4 w-4" />
              Claim Founding Expert Spot
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <Link
              href="/create-expert-account"
              className="flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              Start for Free
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            <Zap className="inline h-3.5 w-3.5 text-orange-400 mr-1" />
            30-day money-back guarantee
          </p>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/3 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <p className="text-3xl font-bold text-orange-400">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs text-orange-300 uppercase tracking-widest mb-3">Why ExpertNear.Me</p>
          <h2 className="text-4xl font-bold">Everything you need to grow locally</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/8 bg-white/4 p-7 hover:border-orange-500/30 hover:bg-white/6 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center mb-4">
                <b.icon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{b.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/5 bg-white/3">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs text-orange-300 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-bold">Up and running in 10 minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-400/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-5">
                  <span className="text-orange-400 font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert profile preview */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-orange-300 uppercase tracking-widest mb-4">Your profile</p>
            <h2 className="text-4xl font-bold mb-5 leading-tight">
              A professional presence your clients will trust
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Your expert profile is your storefront on ExpertNear.Me. It shows your work, your services, your contact info, and your reputation — all in one place, optimized for local search.
            </p>
            <ul className="space-y-3">
              {[
                'Cover photo + profile picture',
                'Services list with descriptions & pricing',
                'Portfolio gallery (photos & videos)',
                'WhatsApp, phone & social links',
                'Map location',
                'Client reviews & ratings',
                '"Founding Expert" badge (lifetime deal)',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-orange-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 bg-slate-800/60 overflow-hidden shadow-2xl"
          >
            <div className="h-32 bg-gradient-to-r from-orange-900/50 to-amber-900/30 relative">
              <div className="absolute -bottom-8 left-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-xl border-2 border-slate-800">
                  AK
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  <Crown className="h-3 w-3" />
                  Founding Expert
                </span>
              </div>
            </div>
            <div className="pt-10 px-6 pb-6">
              <h4 className="font-bold text-white text-lg">Ahmad Karim</h4>
              <p className="text-slate-400 text-sm">Interior Design & Renovation</p>
              <div className="flex items-center gap-1 mt-1.5 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="text-xs text-slate-400 ml-1">4.9 (38 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                Singapore · Furniture & Renovation
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                  WhatsApp
                </button>
                <button className="flex-1 border border-slate-600 hover:border-slate-400 text-slate-300 text-xs font-medium py-2 rounded-lg transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/5">
        <PricingTable asSection />
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-xs text-orange-300 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl font-bold">Common questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-white/8 bg-white/3 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/4 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-white text-sm">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 bg-gradient-to-r from-orange-950/30 to-slate-900/60">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Crown className="h-10 w-10 text-orange-400 mx-auto mb-5" />
          <h2 className="text-4xl font-bold mb-4">
            Ready to claim your founding spot?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Secure your lifetime spot before August 15, 2026. After that — monthly plans only, no exceptions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 group"
            >
              <Crown className="h-4 w-4" />
              Claim Founding Expert Spot
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <Link
              href="/create-expert-account"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-6 py-4 rounded-xl transition-colors"
            >
              Start for Free
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-green-400" /> 30-day refund guarantee</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-orange-400" /> No commissions, ever</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-blue-400" /> 500 spots maximum</span>
          </div>
        </div>
      </section>

    </div>
  );
}
