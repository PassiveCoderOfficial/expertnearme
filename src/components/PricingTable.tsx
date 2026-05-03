'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Crown, Clock, Users, Zap, Star,
  ArrowRight, Bell, Lock, Shield, Trophy, Loader2,
} from 'lucide-react';
import Link from 'next/link';

const TOTAL_SPOTS = 500;
const DEADLINE = new Date('2026-08-15T23:59:59');

interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number; // -1 = lifetime, 30 = monthly, 365 = yearly
  features: string; // JSON string array
  active: boolean;
  featured: boolean;
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function useCountdown(target: Date): TimeLeft {
  const [t, setT] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function parseFeatures(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return raw ? raw.split('\n').map(s => s.trim()).filter(Boolean) : []; }
}

function priceLabel(plan: Plan): { amount: string; period: string } {
  if (plan.duration === -1) return { amount: `$${plan.price}`, period: 'one-time' };
  if (plan.duration === 30)  return { amount: `$${plan.price}`, period: '/month' };
  if (plan.duration === 365) return { amount: `$${plan.price}`, period: '/year' };
  return { amount: `$${plan.price}`, period: `/ ${plan.duration} days` };
}

const FOUNDING_EXPERTS_PREVIEW = [
  { name: 'Ahmad K.', country: '🇸🇬 Singapore', category: 'Interior Design' },
  { name: 'Sara M.', country: '🇦🇪 UAE', category: 'Fashion' },
  { name: 'Raj P.', country: '🇧🇩 Bangladesh', category: 'Engineering' },
  { name: 'You?', country: '🌍 Your Country', category: 'Your Category' },
];

export default function PricingTable({ asSection = false }: { asSection?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [spotsTaken, setSpotsTaken] = useState(47);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [paymentTab, setPaymentTab] = useState<'lemonsqueezy' | 'surjopay' | 'manual'>('manual');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentConfig, setPaymentConfig] = useState<{
    whatsapp: string; defaultTab: string; tabOrder: string[];
    methods: { title: string; details: string; icon?: string }[];
  }>({
    whatsapp: '+8801678669699', defaultTab: 'manual',
    tabOrder: ['lemonsqueezy', 'surjopay', 'manual'],
    methods: [
      { title: 'bKash Personal', details: '01678-669699' },
      { title: 'City Bank PLC', details: 'Account: 1254771069001\nBranch: Uttara' },
    ],
  });

  const timeLeft = useCountdown(DEADLINE);
  const spotsLeft = Math.max(0, TOTAL_SPOTS - spotsTaken);
  const spotsPct = (spotsTaken / TOTAL_SPOTS) * 100;

  useEffect(() => {
    fetch('/api/stats/founding-spots')
      .then(r => r.json())
      .then(d => { if (d.ok) setSpotsTaken(d.taken); })
      .catch(() => {});

    fetch('/api/public/plans')
      .then(r => r.json())
      .then(d => { if (d.plans) setPlans(d.plans); })
      .catch(() => {})
      .finally(() => setPlansLoading(false));

    fetch('/api/public/payment-config')
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setPaymentConfig(d);
          setPaymentTab((d.defaultTab as 'lemonsqueezy' | 'surjopay' | 'manual') || 'manual');
        }
      })
      .catch(() => {});
  }, []);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, source: 'pricing' }),
      });
    } catch {}
    setWaitlistSubmitted(true);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true); setCheckoutError('');
    try {
      const res = await fetch('/api/checkout/lifetime', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) { setCheckoutError(data.error ?? 'Something went wrong.'); return; }
      window.location.href = data.url;
    } catch { setCheckoutError('Network error. Please try again.'); }
    finally { setCheckoutLoading(false); }
  };

  const isLifetime = (p: Plan) => p.duration === -1;

  // Group plans by type
  const freePlans     = plans.filter(p => p.price === 0);
  const monthlyPlans  = plans.filter(p => p.duration === 30 && p.price > 0);
  const yearlyPlans   = plans.filter(p => p.duration === 365 && p.price > 0);
  const lifetimePlans = plans.filter(p => p.duration === -1);

  const hasMonthly = monthlyPlans.length > 0;
  const hasYearly  = yearlyPlans.length > 0;
  // Only show toggle when both monthly AND yearly plans exist
  const showToggle = hasMonthly && hasYearly;
  // The single subscription card to display
  const subPlan = billingCycle === 'monthly'
    ? (monthlyPlans[0] ?? yearlyPlans[0])
    : (yearlyPlans[0] ?? monthlyPlans[0]);
  // If only one type exists (no toggle), just pick whichever is available
  const effectiveSubPlan = showToggle ? subPlan : (monthlyPlans[0] ?? yearlyPlans[0] ?? null);

  // Build the ordered display list: [free..., subscription slot, lifetime...]
  const displayPlans: (Plan | 'sub')[] = [
    ...freePlans,
    ...(effectiveSubPlan ? ['sub' as const] : []),
    ...lifetimePlans,
  ];

  return (
    <div className={asSection ? '' : 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white'}>
      <div className="max-w-6xl mx-auto px-6 py-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 text-orange-300 text-sm font-medium mb-6">
            <Clock className="h-4 w-4" />
            Pre-Launch Offer · Expires August 15, 2026
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-5">
            Get in <span className="text-orange-400">Early.</span>
            <br />Get in <span className="text-orange-400">Forever.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Secure your expert profile before ExpertNear.Me launches globally. Founding Experts get lifetime access, an exclusive badge, and a permanent place in our history.
          </p>
        </motion.div>

        {/* Countdown + Spots */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-16">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Offer ends in</p>
            <div className="flex items-center gap-2">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hrs' },
                { value: timeLeft.minutes, label: 'Min' },
                { value: timeLeft.seconds, label: 'Sec' },
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 min-w-[60px] text-center">
                    <span className="text-3xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                  </div>
                  {i < 3 && <span className="text-slate-600 text-xl font-bold">:</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:block h-16 w-px bg-slate-700" />

          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Founding spots</p>
            <div className="bg-slate-800 border border-orange-500/30 rounded-xl px-6 py-3 mb-2">
              <p className="text-3xl font-bold">
                <span className="text-orange-400">{spotsLeft}</span>
                <span className="text-slate-400 text-base font-normal"> / {TOTAL_SPOTS}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">spots remaining</p>
            </div>
            <div className="w-full max-w-[180px] mx-auto bg-slate-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full" style={{ width: `${spotsPct}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{spotsTaken} already claimed</p>
          </div>
        </motion.div>

        {/* Billing toggle — only when BOTH monthly and yearly plans exist */}
        {showToggle && (
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm transition-colors ${billingCycle === 'monthly' ? 'text-white font-medium' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-orange-500' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm transition-colors ${billingCycle === 'yearly' ? 'text-white font-medium' : 'text-slate-500'}`}>
              Yearly{' '}
              {monthlyPlans[0] && yearlyPlans[0] && (
                <span className="text-orange-400 text-xs font-medium">
                  Save {Math.round((1 - yearlyPlans[0].price / (monthlyPlans[0].price * 12)) * 100)}%
                </span>
              )}
            </span>
          </div>
        )}

        {/* Plans */}
        {plansLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="text-center text-slate-400 py-16">No pricing plans available right now.</div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 items-start pt-6 ${displayPlans.length === 1 ? 'max-w-sm mx-auto' : displayPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
            {displayPlans.map((slot, idx) => {
              const plan = slot === 'sub' ? effectiveSubPlan! : slot;
              const features = parseFeatures(plan.features);
              const { amount, period } = priceLabel(plan);
              const lifetime = isLifetime(plan);
              const isHero = plan.featured;
              const isLocked = !plan.active;

              return (
                <motion.div
                  key={slot === 'sub' ? 'sub-slot' : plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className={`rounded-2xl p-8 flex flex-col relative ${
                    isHero
                      ? 'border-2 border-orange-500/60 bg-gradient-to-b from-orange-950/40 via-slate-900/90 to-slate-900/60 shadow-2xl shadow-orange-950/40 md:-mt-4 md:mb-4'
                      : 'border border-slate-700 bg-slate-800/50'
                  }`}
                >
                  {/* Hero badge */}
                  {isHero && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-lg z-20">
                      <Crown className="h-3.5 w-3.5" />
                      {lifetime ? 'FOUNDING EXPERT — BEST VALUE' : 'MOST POPULAR'}
                    </div>
                  )}

                  {/* Coming soon overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl overflow-hidden p-8">
                      <Lock className="h-7 w-7 text-slate-400 mb-3" />
                      <p className="text-white font-semibold text-lg mb-1">Launching Aug 16, 2026</p>
                      <p className="text-sm text-slate-400 mb-6 text-center">
                        {plan.description || 'Subscriptions go live at launch.'}
                      </p>
                      <button
                        onClick={() => setShowWaitlist(true)}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                      >
                        <Bell className="h-4 w-4" /> Join Waitlist
                      </button>
                    </div>
                  )}

                  <div className={`mb-6 ${isHero ? 'mt-2' : ''}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <p className={`text-xs uppercase tracking-widest ${isHero ? 'text-orange-300' : 'text-slate-400'}`}>
                        {plan.name}
                      </p>
                      {lifetime && (
                        <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-500/30 font-medium">
                          Limited · {spotsLeft} left
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-1.5 mb-1">
                      <span className={`font-bold ${isHero ? 'text-5xl text-white' : 'text-4xl'}`}>{amount}</span>
                      <span className="text-slate-400 text-sm mb-1.5">{period}</span>
                    </div>
                    {plan.description && (
                      <p className={`text-sm mt-1.5 ${isHero ? 'text-orange-300 font-medium' : 'text-slate-400'}`}>
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  {plan.price === 0 ? (
                    <Link
                      href="/create-expert-account"
                      className="block text-center py-3 px-4 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white transition-colors font-medium text-sm mb-8"
                    >
                      Start Free
                    </Link>
                  ) : lifetime ? (
                    <>
                      <button
                        onClick={() => { setActivePlan(plan); setShowPaymentModal(true); }}
                        className="block w-full text-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-orange-500/25 mb-1 group"
                      >
                        Claim Your Spot <ArrowRight className="inline h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <p className="text-center text-xs text-slate-400 mb-8">
                        <Users className="inline h-3.5 w-3.5 mr-1 text-orange-400" />
                        {spotsLeft} of {TOTAL_SPOTS} spots · Expires Aug 15, 2026
                      </p>
                    </>
                  ) : plan.active ? (
                    <button
                      onClick={() => { setActivePlan(plan); setShowPaymentModal(true); }}
                      className="block w-full text-center py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 mb-8 group"
                    >
                      Get Started <ArrowRight className="inline h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center py-3 px-4 rounded-xl border border-slate-700 text-slate-600 font-medium text-sm mb-8 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}

                  {/* Features */}
                  <ul className="space-y-3">
                    {features.map((f, fi) => (
                      <li key={fi} className={`flex items-start gap-3 text-sm ${isHero ? 'text-slate-200' : 'text-slate-300'}`}>
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isHero ? 'text-orange-400' : 'text-green-400'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Value anchors */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400">
          <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-400" />30-day money-back guarantee</span>
          {lifetimePlans[0] && monthlyPlans[0] && (
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-400" />${lifetimePlans[0].price} = less than {Math.ceil(lifetimePlans[0].price / monthlyPlans[0].price)} months of Pro</span>
          )}
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" />Founding Expert badge, yours forever</span>
        </motion.div>

        {/* Hall of Fame */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-20 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/30 to-slate-900/60 p-10 text-center">
          <Trophy className="h-9 w-9 text-orange-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Founding Experts Hall of Fame</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Every Founding Expert gets a permanent listing on our dedicated page — your name, profile link, and contribution to building ExpertNear.Me, honored forever.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {FOUNDING_EXPERTS_PREVIEW.map((expert) => (
              <div key={expert.name} className={`rounded-xl border p-4 text-sm ${expert.name === 'You?' ? 'border-orange-500/40 bg-orange-500/10 border-dashed' : 'border-slate-700 bg-slate-800/50'}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm mx-auto mb-2">
                  {expert.name === 'You?' ? '?' : expert.name[0]}
                </div>
                <p className="font-semibold text-white text-xs">{expert.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{expert.country}</p>
                <p className="text-orange-300 text-xs mt-0.5">{expert.category}</p>
                {expert.name !== 'You?' && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-orange-500/15 text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-500/25">
                    <Crown className="h-2.5 w-2.5" /> Founding
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Founding Expert', 'Early Believer', 'Platform Builder', 'Legacy Member'].map(tag => (
              <span key={tag} className="bg-orange-500/10 border border-orange-500/25 text-orange-300 text-sm px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        </motion.div>

        <div className="text-center mt-10 text-slate-400 text-sm">
          <Zap className="inline h-4 w-4 text-orange-400 mr-1.5" />
          <strong className="text-white">{spotsTaken} experts</strong> have already secured their Founding Expert spot.
        </div>
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowWaitlist(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {!waitlistSubmitted ? (
                <>
                  <Bell className="h-8 w-8 text-orange-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Join the Pro Waitlist</h3>
                  <p className="text-slate-400 text-sm mb-6">We&apos;ll notify you the moment Pro launches on August 16, 2026.</p>
                  <form onSubmit={handleWaitlist} className="space-y-4">
                    <input type="email" required value={waitlistEmail} onChange={e => setWaitlistEmail(e.target.value)} placeholder="your@email.com"
                      className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none text-sm" />
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm">
                      Notify Me at Launch
                    </button>
                  </form>
                  <button onClick={() => setShowWaitlist(false)} className="w-full text-slate-500 hover:text-slate-300 text-sm mt-4 transition-colors">
                    No thanks
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Check className="h-7 w-7 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">You&apos;re on the list!</h3>
                  <p className="text-slate-400 text-sm mb-6">Meanwhile, the Founding Expert deal is still open — {spotsLeft} spots left.</p>
                  <button onClick={() => { setShowWaitlist(false); setShowPaymentModal(true); }}
                    className="block w-full text-center py-3 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold rounded-xl transition-colors text-sm mb-3">
                    Claim Founding Expert Spot Instead
                  </button>
                  <button onClick={() => setShowWaitlist(false)} className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">Close</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Claim Your {activePlan?.name || 'Founding Expert'} Spot
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Choose your preferred payment method</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {(() => {
                const ALL_TABS = {
                  lemonsqueezy: { label: 'LemonSqueezy', sub: 'Card / PayPal' },
                  surjopay:     { label: 'SurjoPay',     sub: 'BD Gateway' },
                  manual:       { label: 'Manual',        sub: 'Bank / bKash' },
                } as const;
                const ordered = (paymentConfig.tabOrder || ['lemonsqueezy', 'surjopay', 'manual'])
                  .filter((k): k is keyof typeof ALL_TABS => k in ALL_TABS);
                return (
                  <div className="flex border-b border-white/8">
                    {ordered.map(id => (
                      <button key={id} onClick={() => setPaymentTab(id)}
                        className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${paymentTab === id ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        {ALL_TABS[id].label}
                        <span className="block text-[10px] font-normal opacity-70">{ALL_TABS[id].sub}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              <div className="p-6">
                {paymentTab === 'lemonsqueezy' && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center mx-auto text-3xl">🍋</div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Pay with LemonSqueezy</h4>
                      <p className="text-slate-400 text-sm">Secure checkout. Accepts all major cards, PayPal and more.</p>
                    </div>
                    {checkoutError && <p className="text-red-400 text-xs">{checkoutError}</p>}
                    <button onClick={handleCheckout} disabled={checkoutLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 disabled:opacity-70 text-slate-900 font-bold rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20">
                      {checkoutLoading ? 'Redirecting…' : `Pay ${activePlan ? `$${activePlan.price}` : '$999'} via LemonSqueezy →`}
                    </button>
                  </div>
                )}
                {paymentTab === 'surjopay' && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto text-2xl font-bold text-green-400">SP</div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Pay with SurjoPay</h4>
                      <p className="text-slate-400 text-sm">BD-friendly gateway. Supports local cards and mobile banking.</p>
                    </div>
                    <a href={`https://wa.me/${paymentConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I want to pay for the ${activePlan?.name ?? 'plan'} ($${activePlan?.price ?? ''}) via SurjoPay.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors text-sm">
                      💬 Contact us on WhatsApp to proceed
                    </a>
                  </div>
                )}
                {paymentTab === 'manual' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300">Transfer <span className="text-orange-400 font-bold">${activePlan?.price ?? 999} USD</span> equivalent to any account below, then contact us on WhatsApp with your receipt.</p>
                    <div className="space-y-3">
                      {paymentConfig.methods.map((method, i) => (
                        <div key={i} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {method.icon
                              ? <img src={method.icon} alt={method.title} className="w-6 h-6 rounded object-cover" />
                              : <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">{method.title[0]}</div>}
                            <p className="text-sm font-semibold text-white">{method.title}</p>
                          </div>
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{method.details}</pre>
                        </div>
                      ))}
                    </div>
                    <a href={`https://wa.me/${paymentConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I have made a manual payment for the ${activePlan?.name ?? 'plan'} ($${activePlan?.price ?? ''}). Please find my payment receipt attached.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors text-sm">
                      💬 Send Receipt on WhatsApp
                    </a>
                    <p className="text-xs text-slate-500 text-center">WhatsApp: {paymentConfig.whatsapp} — We&apos;ll activate your account within 24h.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
