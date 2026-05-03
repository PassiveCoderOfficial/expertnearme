// src/app/pricing/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Crown, User, Building2, MapPin, Phone, Globe, ChevronRight,
  ChevronLeft, Check, Eye, EyeOff, Loader2, ArrowRight, Star
} from 'lucide-react';
import MapPicker, { LatLng } from '@/components/MapPicker';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

const STEPS = ['Account', 'Business', 'Categories', 'Done'];

function OnboardingForm() {
  const router     = useRouter();
  const params     = useSearchParams();
  const isFounder  = params.get('founding') === '1';

  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [form, setForm] = useState({
    name:         '',
    email:        params.get('email') ?? '',
    password:     '',
    confirmPass:  '',
    isBusiness:   false,
    businessName: '',
    countryCode:  '',
    phone:        '',
    whatsapp:     '',
    shortDesc:    '',
    bio:          '',
    webAddress:   '',
    categoryIds:  [] as number[],
    latitude:     null as number | null,
    longitude:    null as number | null,
    mapAddress:   '',
  });

  const [result, setResult] = useState<{ slug: string; countryCode: string } | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/countries')
      .then(r => r.json())
      .then(d => {
        const active = (d.countries ?? d ?? []).filter((c: Country & { active?: boolean }) => c.active !== false);
        setCountries(active);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.countryCode) return;
    setCategories([]);
    setForm(f => ({ ...f, categoryIds: [] }));
    fetch(`/api/country/${form.countryCode}/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []))
      .catch(() => {});
  }, [form.countryCode]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (id: number) => {
    setForm(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(x => x !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  };

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.name.trim())  return setError('Full name is required.'), false;
      if (!form.email.trim()) return setError('Email is required.'), false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Invalid email.'), false;
      if (form.password.length < 8)  return setError('Password must be at least 8 characters.'), false;
      if (form.password !== form.confirmPass) return setError('Passwords do not match.'), false;
    }
    if (step === 1) {
      if (!form.countryCode) return setError('Please select a country.'), false;
      if (!form.shortDesc.trim()) return setError('A short description is required.'), false;
    }
    if (step === 2) {
      if (form.categoryIds.length === 0) return setError('Please select at least one category.'), false;
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/experts/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name,
          email:       form.email,
          password:    form.password,
          isBusiness:  form.isBusiness,
          businessName: form.businessName,
          countryCode: form.countryCode,
          phone:       form.phone,
          whatsapp:    form.whatsapp,
          shortDesc:   form.shortDesc,
          bio:         form.bio,
          webAddress:  form.webAddress,
          categoryIds: form.categoryIds,
          latitude:    form.latitude,
          longitude:   form.longitude,
          mapLocation: form.mapAddress,
          claimFoundingSpot: isFounder,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setResult({ slug: data.slug, countryCode: data.countryCode });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors text-sm';
  const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero / Header */}
      <header className="bg-gradient-to-r from-[#fff5f5] to-white border-b border-[#f0d6d6]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Pricing that grows with your business
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl">
              Free listings forever. Upgrade to Pro or VIP for booking tools, priority placement,
              analytics, and business features that help you convert more leads.
            </p>

            <div className="mt-4 inline-flex items-center gap-3 bg-[#fff0f0] border border-[#f0cfcf] rounded-full px-3 py-1 text-sm text-[#b84c4c]">
              <strong className="font-semibold">Limited time:</strong>
              <span>Claim a 30‑day free VIP upgrade for any account — Free or Pro.</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-[#b84c4c] text-white font-medium shadow hover:bg-[#a43f3f]"
            >
              Get started
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </header>

      {/* Billing toggle */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md ${billingCycle === "monthly" ? "bg-[#b84c4c] text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-md ${billingCycle === "annual" ? "bg-[#b84c4c] text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Annual (limited-time)
          </button>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Free</h3>
              <span className="text-sm text-gray-500">Forever</span>
            </div>

            <div className="mt-6">
              <div className="text-3xl font-extrabold text-gray-900">$0</div>
              <p className="mt-2 text-sm text-gray-600">Basic listing and search visibility</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✅ Searchable profile in categories</li>
              <li>✅ Visible phone number</li>
              <li>✅ Message form (inbound leads)</li>
              <li>✅ Website slot on profile</li>
              <li>✅ Basic analytics (views, contact clicks, booking requests)</li>
              <li>❌ No WhatsApp button</li>
              <li>❌ No booking widget</li>
              <li>❌ No verified badge</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/signup"
                className="block text-center px-4 py-2 rounded-md bg-white border border-[#b84c4c] text-[#b84c4c] font-medium hover:bg-[#fff5f5]"
              >
                Create free listing
              </Link>

              <Link
                href="/pricing/claim-trial"
                className="block text-center px-4 py-2 rounded-md bg-[#f7f7f7] border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Claim 30 Days Free Upgrade to VIP
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pro</h3>
              <span className="text-sm text-gray-500">Best for growing businesses</span>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-extrabold text-gray-900">
                  ${billingCycle === "monthly" ? proMonthly : proAnnual}
                </div>
                <div className="text-sm text-gray-600">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Booking tools, priority placement, and analytics</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✅ Booking widget (calendar + request form)</li>
              <li>✅ Visible phone number + WhatsApp button</li>
              <li>✅ Priority listing in category results</li>
              <li>✅ Basic & enhanced analytics (views, leads, bookings)</li>
              <li>✅ CSV export of leads</li>
              <li>✅ Calendar sync (Google Calendar)</li>
              <li>✅ Website slot on profile</li>
              <li>✅ 30‑day free VIP upgrade available via button</li>
              <li>❌ Sponsored search placement (VIP feature)</li>
              <li>❌ Subdomain minisite (VIP feature)</li>
              <li>❌ Verified badge (VIP only)</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/signup?plan=pro"
                className="block text-center px-4 py-2 rounded-md bg-[#b84c4c] text-white font-medium hover:bg-[#a43f3f]"
              >
                Start Pro
              </Link>

              <Link
                href="/pricing/claim-trial"
                className="block text-center px-4 py-2 rounded-md bg-[#f7f7f7] border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Claim 30 Days Free Upgrade to VIP
              </Link>
            </div>
          </div>

          {/* VIP */}
          <div className="border border-[#7a1f1f]/40 rounded-2xl p-6 bg-[#7a1f1f]/90 backdrop-blur-md text-white shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">VIP</h3>
              <span className="text-sm text-pink-200 font-medium">Premium business suite</span>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-extrabold text-white">
                  ${billingCycle === "monthly" ? vipMonthly : vipAnnual}
                </div>
                <div className="text-sm text-gray-200">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Business / Profile ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold mb-1">Your profile</h1>
              <p className="text-slate-400 text-sm mb-7">Tell clients who you are and what you do.</p>
              <div className="space-y-4">
                {/* Business toggle */}
                <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <button
                    onClick={() => set('isBusiness', false)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!form.isBusiness ? 'bg-orange-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    <User className="h-4 w-4" /> Individual
                  </button>
                  <button
                    onClick={() => set('isBusiness', true)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${form.isBusiness ? 'bg-orange-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Building2 className="h-4 w-4" /> Business
                  </button>
                </div>

                {form.isBusiness && (
                  <div>
                    <label className={labelCls}>Business name *</label>
                    <input className={inputCls} placeholder="Karim Interiors LLC" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
                  </div>
                )}

                <div>
                  <label className={labelCls}>Country *</label>
                  <select className={inputCls} value={form.countryCode} onChange={e => set('countryCode', e.target.value)}>
                    <option value="">— Select your country —</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.flagEmoji} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}><Phone className="inline h-3.5 w-3.5 mr-1" />Phone</label>
                    <input className={inputCls} placeholder="+65 9123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}><Phone className="inline h-3.5 w-3.5 mr-1 text-green-400" />WhatsApp</label>
                    <input className={inputCls} placeholder="+65 9123 4567" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Short description * <span className="text-slate-500">({form.shortDesc.length}/160)</span></label>
                  <textarea className={inputCls} rows={2} maxLength={160} placeholder="One or two sentences about what you do." value={form.shortDesc} onChange={e => set('shortDesc', e.target.value)} />
                </div>

                <div>
                  <label className={labelCls}>Full bio <span className="text-slate-500">(optional)</span></label>
                  <textarea className={inputCls} rows={3} placeholder="Your background, experience, specialisations..." value={form.bio} onChange={e => set('bio', e.target.value)} />
                </div>

                <div>
                  <label className={labelCls}><Globe className="inline h-3.5 w-3.5 mr-1" />Website <span className="text-slate-500">(optional)</span></label>
                  <input className={inputCls} placeholder="https://yourwebsite.com" value={form.webAddress} onChange={e => set('webAddress', e.target.value)} />
                </div>

                {/* Map location picker */}
                <MapPicker
                  label="Location on map (optional — helps buyers find you)"
                  value={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
                  onChange={(coords: LatLng, address?: string) => {
                    set('latitude', coords.lat);
                    set('longitude', coords.lng);
                    if (address) set('mapAddress', address);
                  }}
                  defaultCenter={form.countryCode === 'bd' ? { lat: 23.8, lng: 90.4 } : form.countryCode === 'ae' ? { lat: 25.2, lng: 55.3 } : form.countryCode === 'sg' ? { lat: 1.35, lng: 103.82 } : undefined}
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Categories ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold mb-1">Your categories</h1>
              <p className="text-slate-400 text-sm mb-7">Pick up to 5 categories that describe your work.</p>
              {categories.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">Loading categories…</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map(cat => {
                    const selected = form.categoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          selected
                            ? 'border-orange-500 bg-orange-500/15 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-xl block mb-1">{cat.icon ?? '📌'}</span>
                        <span className="text-xs font-medium">{cat.name}</span>
                        {selected && <Check className="h-3.5 w-3.5 text-orange-400 float-right mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-4">{form.categoryIds.length} / 5 selected</p>
            </motion.div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && result && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isFounder ? 'bg-gradient-to-br from-orange-500 to-amber-400' : 'bg-green-500/20 border border-green-500/30'}`}>
                {isFounder ? <Crown className="h-8 w-8 text-slate-900" /> : <Check className="h-8 w-8 text-green-400" />}
              </div>
              <h1 className="text-3xl font-bold mb-3">
                {isFounder ? "You're a Founding Expert!" : "Profile created!"}
              </h1>
              <p className="text-slate-300 mb-8 max-w-sm mx-auto">
                {isFounder
                  ? "Your Founding Expert profile is live. You're permanently listed on our Hall of Fame page."
                  : "Your expert profile is live. Add photos and services from your dashboard to attract more clients."}
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-100">
              <li>✅ Everything in Pro</li>
              <li>✅ Subdomain minisite (e.g., <span className="font-mono">yourname.expertnear.me</span>)</li>
              <li>✅ Website builder & custom mini‑site</li>
              <li>✅ Sponsored search placement (priority & featured slots)</li>
              <li>✅ Verified badge after verification</li>
              <li>✅ Instant Website Verified badge</li>
              <li>✅ Advanced analytics & conversion reports</li>
              <li>✅ CRM & webhook integrations (outbound webhooks, Zapier/Make, native connectors planned)</li>
              <li>✅ Invoicing, simple accounting, and customer pipeline (VIP dashboard)</li>
              <li>✅ White‑glove onboarding & priority support</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/signup?plan=vip"
                className="block text-center px-4 py-2 rounded-md bg-[#ffffff] text-[#7a1f1f] font-medium hover:bg-[#ffffff]/70"
              >
                Request VIP access
              </Link>

              <Link
                href="/pricing/claim-trial"
                className="block text-center px-4 py-2 rounded-md bg-transparent border border-pink-200 text-sm text-pink-200 hover:bg-[#7a1f1f]/50"
              >
                Claim 30 Days Free Upgrade to VIP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights / details */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What you get</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-100 rounded-xl">
            <h4 className="font-semibold mb-2">Listing & Discovery</h4>
            <p className="text-sm text-gray-600">
              Free profiles are searchable and visible in category pages. Pro and VIP profiles get
              priority placement and featured slots to increase discovery.
            </p>
          </div>

          <div className="p-6 border border-gray-100 rounded-xl">
            <h4 className="font-semibold mb-2">Leads & Booking</h4>
            <p className="text-sm text-gray-600">
              Pro includes a booking widget and WhatsApp button to convert visitors into leads.
              VIP adds CRM/webhook integrations and advanced pipeline tools to manage and convert
              leads at scale.
            </p>
          </div>

          <div className="p-6 border border-gray-100 rounded-xl">
            <h4 className="font-semibold mb-2">Website & Brand</h4>
            <p className="text-sm text-gray-600">
              Every profile has a website slot. VIP members can publish a subdomain minisite and use
              the built‑in website builder to present a richer brand experience.
            </p>
          </div>
        </div>
      </section>

      {/* Subdomain minisite & sponsored placement explanation */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-[#fff8f8] border border-[#f0d6d6] rounded-xl p-6">
          <h3 className="text-lg font-semibold">Subdomain minisites & Sponsored placement</h3>
          <p className="mt-2 text-sm text-gray-700">
            VIP minisites are served on a secure subdomain (e.g., <span className="font-mono">yourname.expertnear.me</span>).
            We use wildcard DNS and secure certificates so each minisite is fast and SEO friendly.
            <strong className="block mt-2">Sponsored placement</strong> means VIP profiles receive priority placement in category search results and a visible “Featured” badge. Placement is based on paid priority plus relevance — we always surface the most relevant experts first.
          </p>
        </div>
      </section>

      {/* Trials, billing & refunds */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h3 className="text-xl font-semibold mb-3">Trials, billing, and refunds</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            We offer a <strong>30‑day free VIP upgrade</strong> that any Free or Pro user can claim
            from their dashboard. The trial is free — no payment required — and lasts 30 days. At
            the end of the trial your account will revert to your previous tier unless you choose
            to upgrade.
          </p>

          <p>
            For paid subscriptions we support monthly and annual billing. Annual billing is offered
            at a limited‑time discounted rate. We recommend using a local or global payment provider
            that supports subscriptions and clear invoices. If refunds are required, we will handle
            them per our policy and local regulations.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-6">Frequently asked questions</h3>

        <div className="space-y-4">
          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">How does the 30‑day VIP upgrade work?</summary>
            <div className="mt-2 text-sm text-gray-700">
              Click the <strong>Claim 30 Days Free Upgrade to VIP</strong> button in your dashboard.
              The trial activates immediately and unlocks VIP features for 30 days. You can upgrade
              to paid VIP at any time during the trial.
            </div>
          </details>

          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">What is the verified badge?</summary>
            <div className="mt-2 text-sm text-gray-700">
              The verified badge is a trust signal reserved for VIP members. Verification is
              performed by our team and may require business or identity documents. Once verified,
              the badge appears on your profile and in search results.
            </div>
          </details>

          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">Which CRMs can I connect?</summary>
            <div className="mt-2 text-sm text-gray-700">
              VIP supports outbound webhooks and Zapier/Make integrations immediately. Native OAuth
              connectors for popular CRMs (HubSpot, Pipedrive, Zoho) are planned and will be
              released progressively.
            </div>
          </details>

          <details className="p-4 border border-gray-100 rounded-lg">
            <summary className="font-medium cursor-pointer">Can I get a refund?</summary>
            <div className="mt-2 text-sm text-gray-700">
              We provide a free 30‑day VIP upgrade so you can evaluate premium features without
              payment. Paid refunds will be handled per our refund policy and local regulations.
            </div>
          </details>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h3 className="text-xl font-semibold">Ready to grow your business?</h3>
        <p className="mt-2 text-gray-600">Create a free listing and claim your 30‑day VIP upgrade today.</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-md bg-[#b84c4c] text-white font-medium hover:bg-[#a43f3f]"
          >
            Create free listing
          </Link>

          <Link
            href="/pricing/claim-trial"
            className="px-6 py-3 rounded-md border border-[#b84c4c] text-[#b84c4c] font-medium hover:bg-[#fff5f5]"
          >
            Claim 30 Days Free Upgrade to VIP
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f9e5e5]/70 border-t border-[#e0c0c0] py-8 text-center text-sm text-gray-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-3">© {new Date().getFullYear()} ExpertNear.Me — All rights reserved.</div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link href="/terms" className="text-gray-600 hover:underline">Terms</Link>
            <Link href="/privacy" className="text-gray-600 hover:underline">Privacy</Link>
            <Link href="/contact" className="text-gray-600 hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}