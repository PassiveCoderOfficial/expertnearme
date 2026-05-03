"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdCheckCircle, MdStar, MdOpenInNew, MdInbox } from "react-icons/md";
import { Crown } from "lucide-react";

type Plan = { id: number; name: string; price: number; currency: string; duration: number; features: string };
type Sub  = {
  id: number;
  status: string;
  isLifetime: boolean;
  gateway: string | null;
  paymentRef: string | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  plan: Plan;
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    "bg-green-500/15 text-green-300 border-green-500/25",
  EXPIRED:   "bg-red-500/15 text-red-300 border-red-500/25",
  CANCELLED: "bg-slate-700 text-slate-400 border-slate-600",
  PAUSED:    "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
};

const GATEWAY_LABEL: Record<string, string> = {
  paddle:       "Paddle",
  lemonsqueezy: "LemonSqueezy",
  surjopay:     "SurjoPay",
  manual:       "Manual",
};

function parseFeatures(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function daysLeft(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function MySubscriptionPage() {
  const [sub, setSub]       = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/subscription")
      .then(r => r.json())
      .then(d => setSub(d.subscription || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── No active subscription ── */
  if (!sub) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Plan</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your ExpertNear.Me subscription.</p>
        </div>

        <div className="bg-slate-800/40 border border-white/8 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/60 border border-white/8 flex items-center justify-center mx-auto mb-4">
            <MdInbox className="text-3xl text-slate-500" />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">You&apos;re on the Free Plan</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Upgrade to unlock featured placement, priority in search, and all Pro features — locked in forever with the Founding Expert deal.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl font-semibold text-slate-900 text-sm transition-colors"
          >
            <Crown className="w-4 h-4" />
            View Pricing & Upgrade
          </Link>
        </div>

        {/* Free plan details */}
        <div className="bg-slate-800/40 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Your Current Plan — Free</h3>
          <ul className="space-y-2.5">
            {[
              "Basic listing (1 country, 1 category)",
              "Up to 5 portfolio images",
              "Contact info visible to buyers",
              "Public profile page",
            ].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                <MdCheckCircle className="text-slate-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const features = parseFeatures(sub.plan.features);
  const remaining = daysLeft(sub.endsAt);
  const isFoundingExpert = sub.isLifetime && sub.plan.duration === -1;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Plan</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your active ExpertNear.Me subscription.</p>
      </div>

      {/* Plan card */}
      <div className={`rounded-2xl border p-6 ${isFoundingExpert ? "bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/30" : "bg-slate-800/40 border-white/8"}`}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            {isFoundingExpert ? (
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-400" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-700/60 border border-white/10 flex items-center justify-center">
                <MdStar className="text-2xl text-slate-400" />
              </div>
            )}
            <div>
              <h2 className={`font-bold text-lg ${isFoundingExpert ? "text-orange-300" : "text-white"}`}>{sub.plan.name}</h2>
              {isFoundingExpert && (
                <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5 font-semibold">
                  ✦ Founding Expert
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[sub.status] || STATUS_COLOR.CANCELLED}`}>
            {sub.status}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-slate-900/50 border border-white/8 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Price Paid</p>
            <p className="font-bold text-white text-sm">
              {sub.isLifetime ? "Lifetime Deal" : `${sub.plan.currency} ${sub.plan.price}/mo`}
            </p>
          </div>
          <div className="bg-slate-900/50 border border-white/8 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Started</p>
            <p className="font-bold text-white text-sm">{new Date(sub.startsAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-slate-900/50 border border-white/8 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Expires</p>
            <p className={`font-bold text-sm ${sub.isLifetime ? "text-orange-400" : remaining !== null && remaining < 14 ? "text-red-400" : "text-white"}`}>
              {sub.isLifetime ? "Never ♾" : sub.endsAt ? new Date(sub.endsAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {remaining !== null && remaining < 14 && !sub.isLifetime && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm font-semibold">⚠ Expires in {remaining} day{remaining !== 1 ? "s" : ""}</p>
            <p className="text-red-400/70 text-xs mt-0.5">Renew before it expires to keep your listing active.</p>
          </div>
        )}

        {/* Gateway & payment ref */}
        {(sub.gateway || sub.paymentRef) && (
          <div className="border-t border-white/8 pt-4 mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
            {sub.gateway && <span>Gateway: <span className="text-slate-300">{GATEWAY_LABEL[sub.gateway] || sub.gateway}</span></span>}
            {sub.paymentRef && <span>Ref: <span className="text-slate-300 font-mono">{sub.paymentRef}</span></span>}
          </div>
        )}
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="bg-slate-800/40 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">What&apos;s Included</h3>
          <ul className="space-y-2.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                <MdCheckCircle className="text-green-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm text-slate-300 transition-colors"
        >
          <MdOpenInNew />
          View All Plans
        </Link>
        {!sub.isLifetime && (
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 rounded-xl text-sm text-slate-900 font-semibold transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Lifetime
          </Link>
        )}
      </div>
    </div>
  );
}
