'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Crown, Clock, Users, Zap, Star,
  ArrowRight, Bell, Lock, Shield, Trophy
} from 'lucide-react';
import Link from 'next/link';

const TOTAL_SPOTS = 500;
const DEADLINE = new Date('2026-08-15T23:59:59');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(target: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

const FREE_FEATURES = [
  { text: 'Basic profile listing', included: true },
  { text: '1 country listing', included: true },
  { text: '1 category', included: true },
  { text: '5 portfolio images', included: true },
  { text: 'Contact form', included: true },
  { text: 'Standard search placement', included: true },
  { text: 'Priority search placement', included: false },
  { text: 'Services & pricing table', included: false },
  { text: 'Advanced analytics', included: false },
  { text: 'WhatsApp integration', included: false },
  { text: 'Founding Expert badge', included: false },
];

const PRO_FEATURES = [
  { text: 'Everything in Free', included: true },
  { text: 'Priority search placement', included: true },
  { text: 'Unlimited categories', included: true },
  { text: 'Unlimited portfolio', included: true },
  { text: 'Services & pricing table', included: true },
  { text: 'Advanced analytics dashboard', included: true },
  { text: 'WhatsApp & social links', included: true },
  { text: 'Verified badge', included: true },
  { text: 'Multiple countries (up to 3)', included: true },
  { text: 'Priority email support', included: true },
  { text: 'Founding Expert badge', included: false },
];

const LIFETIME_FEATURES = [
  { text: 'Everything in Pro, forever', included: true },
  { text: '"Founding Expert" gold badge', included: true },
  { text: 'Listed on Founding Experts page', included: true },
  { text: 'Featured on launch day (Aug 16)', included: true },
  { text: 'Priority above Pro in search', included: true },
  { text: "Private founders' community", included: true },
  { text: 'Input on product roadmap', included: true },
  { text: 'Early beta feature access', included: true },
  { text: 'Free profile setup assistance', included: true },
  { text: 'All future features included', included: true },
  { text: 'Price locked forever', included: true },
];

const FOUNDING_EXPERTS_PREVIEW = [
  { name: 'Ahmad K.', country: '🇸🇬 Singapore', category: 'Interior Design' },
  { name: 'Sara M.', country: '🇦🇪 UAE', category: 'Fashion' },
  { name: 'Raj P.', country: '🇧🇩 Bangladesh', category: 'Engineering' },
  { name: 'You?', country: '🌍 Your Country', category: 'Your Category' },
];

export default function PricingTable({ asSection = false }: { asSection?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [spotsTaken, setSpotsTaken] = useState(47);
  const timeLeft = useCountdown(DEADLINE);
  const spotsLeft = Math.max(0, TOTAL_SPOTS - spotsTaken);
  const spotsPct = (spotsTaken / TOTAL_SPOTS) * 100;

  useEffect(() => {
    fetch('/api/stats/founding-spots')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setSpotsTaken(d.taken); })
      .catch(() => {});
  }, []);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'lemonsqueezy' | 'surjopay' | 'manual'>('manual');
  const [paymentConfig, setPaymentConfig] = useState<{
    whatsapp: string;
    defaultTab: string;
    tabOrder: string[];
    methods: { title: string; details: string; icon?: string }[];
  }>({
    whatsapp: '+8801678669699',
    defaultTab: 'manual',
    tabOrder: ['lemonsqueezy', 'surjopay', 'manual'],
    methods: [
      { title: 'bKash Personal', details: '01678-669699' },
      { title: 'City Bank PLC (Current Account)', details: 'Name: Passive Coder\nAccount: 1254771069001\nBranch: Uttara\nRouting: 225264634' },
    ],
  });

  useEffect(() => {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, source: 'pricing' }),
      });
    } catch {}
    setWaitlistSubmitted(true);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/checkout/lifetime', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError('Network error. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className={asSection ? '' : 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white'}>
      <div className="max-w-6xl mx-auto px-6 py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 text-orange-300 text-sm font-medium mb-6">
            <Clock className="h-4 w-4" />
            Pre-Launch Offer · Expires August 15, 2026
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-5">
            Get in <span className="text-orange-400">Early.</span>
            <br />
            Get in <span className="text-orange-400">Forever.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Secure your expert profile before ExpertNear.Me launches globally. Founding Experts get lifetime access, an exclusive badge, and a permanent place in our history.
          </p>
        </motion.div>

        {/* Countdown + Spots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-16"
        >
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
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full"
                style={{ width: `${spotsPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{spotsTaken} already claimed</p>
          </div>
        </motion.div>

        {/* Pro billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-orange-500' : 'bg-slate-600'}`}
            aria-label="Toggle billing cycle"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`}
            />
          </button>
          <span className={`text-sm transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
            Yearly{' '}
            <span className="text-orange-400 text-xs font-medium">Save 58%</span>
          </span>
          <span className="text-xs text-slate-600 italic hidden sm:inline">(Pro pricing shown — available at launch)</span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 flex flex-col"
          >
            <div className="mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Free</p>
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400 text-sm mb-1">/month</span>
              </div>
              <p className="text-sm text-slate-400">Get discovered. No credit card needed.</p>
            </div>

            <Link
              href="/create-expert-account"
              className="block text-center py-3 px-4 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white transition-colors font-medium text-sm mb-8"
            >
              Start Free
            </Link>

            <ul className="space-y-3">
              {FREE_FEATURES.map(f => (
                <li
                  key={f.text}
                  className={`flex items-start gap-3 text-sm ${f.included ? 'text-slate-300' : 'text-slate-600 line-through'}`}
                >
                  {f.included
                    ? <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    : <X className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                  }
                  {f.text}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Lifetime Deal — HERO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border-2 border-orange-500/60 bg-gradient-to-b from-orange-950/40 via-slate-900/90 to-slate-900/60 p-8 flex flex-col relative shadow-2xl shadow-orange-950/40 md:-mt-4 md:mb-4"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-lg">
              <Crown className="h-3.5 w-3.5" />
              FOUNDING EXPERT — BEST VALUE
            </div>

            <div className="mb-6 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-orange-300 uppercase tracking-widest">Lifetime Deal</p>
                <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-500/30 font-medium">
                  Limited · {spotsLeft} left
                </span>
              </div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-5xl font-bold text-white">$999</span>
                <span className="text-slate-400 text-sm mb-1.5">one-time</span>
              </div>
              <p className="text-xs text-slate-500 line-through">$1,188/yr at regular Pro pricing</p>
              <p className="text-sm text-orange-300 mt-1.5 font-medium">Pay once. Own it forever.</p>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="block w-full text-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-orange-500/25 mb-1 group"
            >
              Claim Your Spot{' '}<ArrowRight className="inline h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-center text-xs text-slate-400 mb-8">
              <Users className="inline h-3.5 w-3.5 mr-1 text-orange-400" />
              {spotsLeft} of {TOTAL_SPOTS} spots · Expires Aug 15, 2026
            </p>

            <ul className="space-y-3">
              {LIFETIME_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-3 text-sm text-slate-200">
                  <Check className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  {f.text}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pro — Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-700 bg-slate-800/30 p-8 flex flex-col relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl p-8">
              <Lock className="h-7 w-7 text-slate-400 mb-3" />
              <p className="text-white font-semibold text-lg mb-1">Launching Aug 16, 2026</p>
              <p className="text-sm text-slate-400 mb-6 text-center">
                Monthly & yearly subscriptions go live at launch. Join the waitlist to be first.
              </p>
              <button
                onClick={() => setShowWaitlist(true)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <Bell className="h-4 w-4" />
                Join Waitlist
              </button>
            </div>

            <div className="opacity-40 pointer-events-none">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Pro</p>
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-4xl font-bold">
                  {billingCycle === 'monthly' ? '$99' : '$499'}
                </span>
                <span className="text-slate-400 text-sm mb-1">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <p className="text-sm text-slate-400">Full professional presence.</p>

              <button
                disabled
                className="block w-full text-center py-3 px-4 rounded-xl border border-slate-700 text-slate-600 font-medium text-sm mt-6 mb-8 cursor-not-allowed"
              >
                Coming Soon
              </button>

              <ul className="space-y-3">
                {PRO_FEATURES.map(f => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-3 text-sm ${f.included ? 'text-slate-300' : 'text-slate-600 line-through'}`}
                  >
                    {f.included
                      ? <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      : <X className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                    }
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Value anchor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400"
        >
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            30-day money-back guarantee
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-400" />
            $999 = less than 11 months of Pro
          </span>
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Founding Expert badge, yours forever
          </span>
        </motion.div>

        {/* Founding Experts Hall of Fame */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/30 to-slate-900/60 p-10 text-center"
        >
          <Trophy className="h-9 w-9 text-orange-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Founding Experts Hall of Fame</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Every Founding Expert gets a permanent listing on our dedicated page — your name, profile link, and contribution to building ExpertNear.Me, honored forever.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {FOUNDING_EXPERTS_PREVIEW.map((expert, i) => (
              <div
                key={expert.name}
                className={`rounded-xl border p-4 text-sm ${
                  expert.name === 'You?'
                    ? 'border-orange-500/40 bg-orange-500/10 border-dashed'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm mx-auto mb-2">
                  {expert.name === 'You?' ? '?' : expert.name[0]}
                </div>
                <p className="font-semibold text-white text-xs">{expert.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{expert.country}</p>
                <p className="text-orange-300 text-xs mt-0.5">{expert.category}</p>
                {i < 3 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-orange-500/15 text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-500/25">
                    <Crown className="h-2.5 w-2.5" />
                    Founding
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Founding Expert', 'Early Believer', 'Platform Builder', 'Legacy Member'].map(tag => (
              <span
                key={tag}
                className="bg-orange-500/10 border border-orange-500/25 text-orange-300 text-sm px-3 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Social proof footer */}
        <div className="text-center mt-10 text-slate-400 text-sm">
          <Zap className="inline h-4 w-4 text-orange-400 mr-1.5" />
          <strong className="text-white">{spotsTaken} experts</strong> have already secured their Founding Expert spot.
        </div>
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowWaitlist(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              {!waitlistSubmitted ? (
                <>
                  <Bell className="h-8 w-8 text-orange-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Join the Pro Waitlist</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    We'll notify you the moment Pro launches on August 16, 2026. One email, no spam.
                  </p>
                  <form onSubmit={handleWaitlist} className="space-y-4">
                    <input
                      type="email"
                      required
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors text-sm"
                    />
                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Notify Me at Launch
                    </button>
                  </form>
                  <button
                    onClick={() => setShowWaitlist(false)}
                    className="w-full text-slate-500 hover:text-slate-300 text-sm mt-4 transition-colors"
                  >
                    No thanks — I'll wait
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Check className="h-7 w-7 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    We'll email you the moment Pro launches. Meanwhile, the Founding Expert deal is still open — only {spotsLeft} spots left.
                  </p>
                  <button
                    onClick={() => { setShowWaitlist(false); setShowPaymentModal(true); }}
                    className="block w-full text-center py-3 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold rounded-xl transition-colors text-sm mb-3"
                  >
                    Claim Founding Expert Spot Instead
                  </button>
                  <button
                    onClick={() => setShowWaitlist(false)}
                    className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Options Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div>
                  <h3 className="text-lg font-bold text-white">Claim Your Founding Expert Spot</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Choose your preferred payment method</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs — order driven by paymentConfig.tabOrder */}
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
                    {ordered.map(id => {
                      const tab = ALL_TABS[id];
                      return (
                        <button
                          key={id}
                          onClick={() => setPaymentTab(id)}
                          className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                            paymentTab === id
                              ? 'border-orange-500 text-orange-400'
                              : 'border-transparent text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {tab.label}
                          <span className="block text-[10px] font-normal opacity-70">{tab.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Tab content */}
              <div className="p-6">
                {paymentTab === 'lemonsqueezy' && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center mx-auto text-3xl">
                      🍋
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Pay with LemonSqueezy</h4>
                      <p className="text-slate-400 text-sm">Secure checkout via LemonSqueezy. Accepts all major cards, PayPal and more.</p>
                    </div>
                    {checkoutError && <p className="text-red-400 text-xs">{checkoutError}</p>}
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 disabled:opacity-70 disabled:cursor-wait text-slate-900 font-bold rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20"
                    >
                      {checkoutLoading ? 'Redirecting to checkout…' : 'Pay $999 via LemonSqueezy →'}
                    </button>
                    <p className="text-xs text-slate-500">You'll be redirected to a secure LemonSqueezy checkout page.</p>
                  </div>
                )}

                {paymentTab === 'surjopay' && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto text-2xl font-bold text-green-400">
                      SP
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Pay with SurjoPay</h4>
                      <p className="text-slate-400 text-sm">Bangladesh-friendly payment gateway. Supports local cards and mobile banking.</p>
                    </div>
                    <a
                      href={`https://wa.me/${paymentConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I want to pay for the Founding Expert plan ($999) via SurjoPay.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      <span>💬</span> Contact us on WhatsApp to proceed
                    </a>
                    <p className="text-xs text-slate-500">SurjoPay integration coming soon — contact us on WhatsApp and we'll send you a payment link directly.</p>
                  </div>
                )}

                {paymentTab === 'manual' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300">Transfer <span className="text-orange-400 font-bold">$999 USD</span> equivalent to any of the accounts below, then contact us on WhatsApp with your receipt.</p>

                    <div className="space-y-3">
                      {paymentConfig.methods.map((method, i) => (
                        <div key={i} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {method.icon ? (
                              <img src={method.icon} alt={method.title} className="w-6 h-6 rounded object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                                {method.title[0]}
                              </div>
                            )}
                            <p className="text-sm font-semibold text-white">{method.title}</p>
                          </div>
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{method.details}</pre>
                        </div>
                      ))}
                    </div>

                    <a
                      href={`https://wa.me/${paymentConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I have made a manual payment for the Founding Expert plan ($999). Please find my payment receipt attached.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      <span>💬</span> Send Receipt on WhatsApp
                    </a>
                    <p className="text-xs text-slate-500 text-center">WhatsApp: {paymentConfig.whatsapp} — We'll activate your account within 24 hours of receiving payment confirmation.</p>
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
