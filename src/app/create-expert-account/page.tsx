'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Crown, User, Building2, MapPin, Phone, Globe, ChevronRight,
  ChevronLeft, Check, Eye, EyeOff, Loader2, ArrowRight, Star
} from 'lucide-react';
import MapPicker, { LatLng } from '@/components/MapPicker';

interface Country { code: string; name: string; flagEmoji: string; }
interface Category { id: number; name: string; icon: string | null; color: string | null; slug: string; }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-orange-400 font-bold tracking-tight">ExpertNear.Me</Link>
          <span className="text-xs text-slate-500">Already have an account?{' '}
            <Link href="/login" className="text-orange-400 hover:underline">Sign in</Link>
          </span>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Founder badge */}
        {isFounder && step < 3 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 mb-8 text-sm text-orange-300">
            <Crown className="h-4 w-4 shrink-0" />
            <span><strong>Founding Expert</strong> — Your payment was received. Complete your profile to go live.</span>
          </div>
        )}

        {/* Step indicators */}
        {step < 3 && (
          <div className="flex items-center gap-0 mb-10">
            {STEPS.slice(0, 3).map((label, i) => (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? 'bg-orange-500 text-slate-900'
                    : i === step ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 ${i === step ? 'text-orange-400' : 'text-slate-500'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-2 mt-[-14px] ${i < step ? 'bg-orange-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 0: Account ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-slate-400 text-sm mb-7">Your login credentials for ExpertNear.Me.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input className={inputCls} placeholder="Ahmad Karim" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email address *</label>
                  <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-11'} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-200">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm password *</label>
                  <input className={inputCls} type="password" placeholder="Repeat password" value={form.confirmPass} onChange={e => set('confirmPass', e.target.value)} />
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
              {isFounder && (
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm px-4 py-2 rounded-full mb-6">
                  <Star className="h-4 w-4" />
                  Founding Expert · Permanent Hall of Fame listing
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/${result.countryCode}/expert/${result.slug}`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:from-orange-400 hover:to-amber-300 transition-all"
                >
                  View My Profile <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
              {isFounder && (
                <div className="mt-6">
                  <Link href="/founding-experts" className="text-orange-400 hover:underline text-sm">
                    View Founding Experts Hall of Fame →
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Navigation buttons */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={back} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>Create Profile <Check className="h-4 w-4" /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateExpertAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
