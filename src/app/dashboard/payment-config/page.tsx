"use client";

import { useEffect, useState } from "react";
import { MdSave, MdVisibility, MdVisibilityOff, MdCheckCircle } from "react-icons/md";

type GatewayConfig = {
  key: string;
  label: string;
  flag?: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
};

const GATEWAYS: GatewayConfig[] = [
  {
    key: "paddle",
    label: "Paddle",
    description: "Global payment processing — subscriptions, one-time payments, tax handled automatically.",
    fields: [
      { key: "paddle_vendor_id",      label: "Vendor ID",         placeholder: "12345",               secret: false },
      { key: "paddle_api_key",        label: "API Key",            placeholder: "sk_live_…",           secret: true  },
      { key: "paddle_webhook_secret", label: "Webhook Secret",     placeholder: "pdl_ntf_…",           secret: true  },
    ],
  },
  {
    key: "lemonsqueezy",
    label: "LemonSqueezy",
    description: "Merchant of record platform — ideal for lifetime deals and digital products.",
    fields: [
      { key: "lemonsqueezy_api_key",        label: "API Key",        placeholder: "eyJ0eXAiOi…",      secret: true  },
      { key: "lemonsqueezy_store_id",       label: "Store ID",       placeholder: "12345",             secret: false },
      { key: "lemonsqueezy_webhook_secret", label: "Webhook Secret", placeholder: "wh_…",              secret: true  },
    ],
  },
  {
    key: "surjopay",
    label: "SurjoPay",
    flag: "🇧🇩",
    description: "Bangladeshi payment gateway — supports bKash, Nagad, Rocket, and local cards.",
    fields: [
      { key: "surjopay_merchant_id", label: "Merchant ID",  placeholder: "SP_XXXXX",                  secret: false },
      { key: "surjopay_api_key",     label: "API Key",       placeholder: "sp_live_…",                 secret: true  },
      { key: "surjopay_api_secret",  label: "API Secret",    placeholder: "sp_secret_…",               secret: true  },
    ],
  },
];

export default function PaymentConfigPage() {
  const [values, setValues]     = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [saved, setSaved]       = useState<Record<string, boolean>>({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/admin/payment-config")
      .then(r => r.json())
      .then(d => { if (d.config) setValues(d.config); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (gatewayKey: string, fields: GatewayConfig["fields"]) => {
    setSaving(prev => ({ ...prev, [gatewayKey]: true }));
    const body: Record<string, string> = { active_gateway: values["active_gateway"] || "" };
    fields.forEach(f => { body[f.key] = values[f.key] || ""; });

    await fetch("/api/admin/payment-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(prev => ({ ...prev, [gatewayKey]: false }));
    setSaved(prev => ({ ...prev, [gatewayKey]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [gatewayKey]: false })), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Gateway Config</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure your payment processors. Keys are stored encrypted in the database.</p>
      </div>

      {/* Active gateway selector */}
      <div className="bg-slate-800/40 border border-white/8 rounded-2xl px-6 py-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Active Gateway</h2>
        <p className="text-xs text-slate-400">Select which payment gateway processes new subscriptions.</p>
        <div className="grid grid-cols-3 gap-2">
          {GATEWAYS.map(g => (
            <button
              key={g.key}
              onClick={() => setValues(prev => ({ ...prev, active_gateway: g.key }))}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${values["active_gateway"] === g.key ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-white/8 bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
            >
              {g.flag ? `${g.flag} ${g.label}` : g.label}
            </button>
          ))}
        </div>
      </div>

      {GATEWAYS.map(gw => (
        <div key={gw.key} className="bg-slate-800/40 border border-white/8 rounded-2xl overflow-hidden">
          {/* Gateway header */}
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {gw.flag && <span className="text-xl">{gw.flag}</span>}
                <h2 className="font-bold text-white">{gw.label}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{gw.description}</p>
            </div>
            {saved[gw.key] && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm">
                <MdCheckCircle /> Saved
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="px-6 py-5 space-y-4">
            {gw.fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{f.label}</label>
                <div className="relative">
                  <input
                    type={f.secret && !revealed[f.key] ? "password" : "text"}
                    value={values[f.key] || ""}
                    onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-orange-500/40 transition-colors pr-10"
                  />
                  {f.secret && (
                    <button
                      onClick={() => setRevealed(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {revealed[f.key] ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => handleSave(gw.key, gw.fields)}
              disabled={saving[gw.key]}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl text-sm text-slate-900 font-semibold transition-colors mt-2"
            >
              <MdSave />
              {saving[gw.key] ? "Saving…" : `Save ${gw.label} Config`}
            </button>
          </div>
        </div>
      ))}

      <div className="bg-slate-800/40 border border-amber-500/15 rounded-2xl p-5">
        <p className="text-xs text-amber-400 font-semibold mb-1">Security Note</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          API keys are stored in the database Settings table. For production, consider using environment variables
          (<code className="text-slate-400">PADDLE_API_KEY</code>, <code className="text-slate-400">LS_API_KEY</code>, etc.)
          and only use this panel for non-secret configuration values like vendor IDs and prefixes.
        </p>
      </div>
    </div>
  );
}
