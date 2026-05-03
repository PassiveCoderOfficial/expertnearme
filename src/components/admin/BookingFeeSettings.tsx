'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Save, CheckCircle, Percent } from 'lucide-react';

interface FeeConfig {
  bookingFeeEnabled: boolean;
  bookingFeeDefault: number;
  bookingFeeMin: number;
  bookingFeeMax: number;
  platformCommissionPct: number;
  agentCommissionPct: number;
  expertSubscriptionCommissionPct: number;
}

const numInput = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

export default function BookingFeeSettings() {
  const [cfg, setCfg] = useState<FeeConfig>({
    bookingFeeEnabled: true,
    bookingFeeDefault: 25,
    bookingFeeMin: 10,
    bookingFeeMax: 50,
    platformCommissionPct: 50,
    agentCommissionPct: 50,
    expertSubscriptionCommissionPct: 20,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/booking-fee')
      .then((r) => r.json())
      .then((d) => { setCfg(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (k: keyof FeeConfig, v: any) => setCfg((c) => ({ ...c, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/booking-fee', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Example calculation
  const feeEx = cfg.bookingFeeDefault;
  const platformCut = (feeEx * cfg.platformCommissionPct) / 100;
  const agentCut = (platformCut * cfg.agentCommissionPct) / 100;
  const expertCut = feeEx - platformCut;

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-400" /> Booking Fee & Commission
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-xl text-slate-900 font-semibold text-xs transition-colors"
        >
          {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Enable/disable */}
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <div>
          <p className="text-sm text-white font-medium">Enable Booking Fee</p>
          <p className="text-xs text-slate-500 mt-0.5">Charge a non-refundable token fee at booking time.</p>
        </div>
        <button
          onClick={() => set('bookingFeeEnabled', !cfg.bookingFeeEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${cfg.bookingFeeEnabled ? 'bg-orange-500' : 'bg-slate-700'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${cfg.bookingFeeEnabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {cfg.bookingFeeEnabled && (
        <>
          {/* Fee range */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Min Fee ($)</label>
              <input type="number" value={cfg.bookingFeeMin} min={0} onChange={(e) => set('bookingFeeMin', parseFloat(e.target.value))} className={numInput} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Default Fee ($)</label>
              <input type="number" value={cfg.bookingFeeDefault} min={0} onChange={(e) => set('bookingFeeDefault', parseFloat(e.target.value))} className={numInput} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Max Fee ($)</label>
              <input type="number" value={cfg.bookingFeeMax} min={0} onChange={(e) => set('bookingFeeMax', parseFloat(e.target.value))} className={numInput} />
            </div>
          </div>

          {/* Platform cut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Platform Commission (% of fee)</label>
              <div className="relative">
                <input type="number" value={cfg.platformCommissionPct} min={0} max={100} onChange={(e) => set('platformCommissionPct', parseFloat(e.target.value))} className={numInput + ' pr-8'} />
                <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Agent gets (% of platform cut)</label>
              <div className="relative">
                <input type="number" value={cfg.agentCommissionPct} min={0} max={100} onChange={(e) => set('agentCommissionPct', parseFloat(e.target.value))} className={numInput + ' pr-8'} />
                <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Subscription commission */}
      <div className="border-t border-white/5 pt-4">
        <label className="text-xs text-slate-500 mb-1 block">Agent commission on expert subscriptions (%)</label>
        <div className="relative max-w-[200px]">
          <input
            type="number"
            value={cfg.expertSubscriptionCommissionPct}
            min={0}
            max={100}
            onChange={(e) => set('expertSubscriptionCommissionPct', parseFloat(e.target.value))}
            className={numInput + ' pr-8'}
          />
          <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-600 mt-1">Agents earn this % of the expert&apos;s subscription payment, every renewal.</p>
      </div>

      {/* Live example */}
      {cfg.bookingFeeEnabled && (
        <div className="bg-slate-900 rounded-xl p-3 text-xs">
          <p className="text-slate-400 font-medium mb-2">Example (${feeEx} booking fee):</p>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Client pays</span><span className="text-white">${feeEx.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Expert receives</span><span className="text-green-400">${expertCut.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Platform keeps</span><span className="text-blue-400">${(platformCut - agentCut).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Agent commission</span><span className="text-orange-400">${agentCut.toFixed(2)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
