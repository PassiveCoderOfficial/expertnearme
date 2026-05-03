'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Users, Copy, CheckCircle, DollarSign, TrendingUp, Link as LinkIcon,
  Plus, Clock, ExternalLink,
} from 'lucide-react';

interface Commission {
  id: number;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description: string | null;
}

interface Referral {
  id: number;
  referralCode: string;
  referralType: string;
  status: string;
  commissionPct: number;
  createdAt: string;
  referredUser: { id: number; name: string; email: string } | null;
  commissions: Commission[];
}

const COMMISSION_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400',
  APPROVED: 'text-blue-400',
  PAID: 'text-green-400',
  CANCELLED: 'text-red-400',
};

export default function AgentDashboardPage() {
  const { session } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const isAdmin = session?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.role);

  useEffect(() => {
    fetch('/api/admin/agents')
      .then((r) => r.json())
      .then((d) => {
        setReferrals(d.referrals || []);
        setTotalEarned(d.totalEarned || 0);
        setPendingEarnings(d.pendingEarnings || 0);
        setLoading(false);
      });
  }, []);

  const generateReferralLink = async () => {
    setGenerating(true);
    const res = await fetch('/api/admin/agents', { method: 'POST' });
    const newRef = await res.json();
    setReferrals((prev) => [newRef, ...prev]);
    setGenerating(false);
  };

  const copyLink = (id: number, code: string) => {
    const url = `${window.location.origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter((r) => r.referredUser).length;
  const allCommissions = referrals.flatMap((r) => r.commissions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" /> Agent & Referrals
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Refer experts and buyers. Earn recurring commissions on subscriptions and booking fees.
          </p>
        </div>
        <button
          onClick={generateReferralLink}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {generating ? 'Generating...' : 'New Referral Link'}
        </button>
      </div>

      {/* How it works */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
        <h3 className="text-orange-300 font-semibold text-sm mb-2">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
            <p>Generate your referral link and share it with potential experts or buyers.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
            <p>When they sign up via your link and an expert subscribes, you earn 20% of their subscription.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
            <p>Commissions are <strong>recurring</strong> — every renewal earns you the same percentage automatically.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Links', value: totalReferrals, icon: LinkIcon, color: 'text-slate-300' },
          { label: 'Active Referrals', value: activeReferrals, icon: Users, color: 'text-blue-400' },
          { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
          { label: 'Pending', value: `$${pendingEarnings.toFixed(2)}`, icon: Clock, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Referral links */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-white">Your Referral Links</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <LinkIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm">No referral links yet.</p>
            <button
              onClick={generateReferralLink}
              className="mt-3 text-orange-400 hover:text-orange-300 text-sm"
            >
              Generate your first link →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {referrals.map((ref) => {
              const refUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://expertnear.me'}/signup?ref=${ref.referralCode}`;
              const earned = ref.commissions.reduce((s, c) => s + (c.status !== 'CANCELLED' ? c.amount : 0), 0);

              return (
                <div key={ref.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-orange-400 text-xs font-mono bg-orange-500/10 px-2 py-0.5 rounded">
                          {ref.referralCode}
                        </code>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ref.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {ref.status}
                        </span>
                        <span className="text-xs text-slate-500">{ref.commissionPct}% commission</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          readOnly
                          value={refUrl}
                          className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-400 font-mono min-w-0"
                        />
                        <button
                          onClick={() => copyLink(ref.id, ref.referralCode)}
                          className="shrink-0 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {copiedId === ref.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-green-400 font-bold text-sm">${earned.toFixed(2)}</p>
                      <p className="text-slate-500 text-xs">earned</p>
                    </div>
                  </div>

                  {ref.referredUser && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      Referred: <span className="text-white">{ref.referredUser.name}</span>
                      <span className="text-slate-600">({ref.referredUser.email})</span>
                    </div>
                  )}

                  {ref.commissions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {ref.commissions.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {c.type} · {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`font-medium ${COMMISSION_STATUS_COLOR[c.status] || 'text-slate-400'}`}>
                            +${c.amount.toFixed(2)} ({c.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Commission structure info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Commission Structure</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Expert Subscription (monthly/yearly)</span>
              <span className="text-green-400 font-semibold">20% recurring</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Booking Fee (platform gets 50%)</span>
              <span className="text-green-400 font-semibold">50% of platform cut</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Lifetime Deal</span>
              <span className="text-green-400 font-semibold">20% one-time</span>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-3 text-xs text-slate-400">
            <p className="font-semibold text-white mb-1">Example:</p>
            <p>Expert pays $99/month → You earn $19.80/month, forever.</p>
            <p className="mt-1">Booking fee $25 → Platform gets $12.50 → You earn $6.25 per booking.</p>
            <p className="mt-1">Lifetime deal $999 → You earn $199.80 once.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
