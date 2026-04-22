"use client";

import { useState, useEffect } from "react";
import { MdSettings, MdSave, MdImage } from "react-icons/md";
import dynamic from "next/dynamic";

const MediaBrowser = dynamic(() => import("@/components/media/MediaBrowser"), { ssr: false });

interface SiteSettings {
  emailVerificationRequired: boolean;
  allowGoogleLogin: boolean;
  allowSignup: boolean;
  logo: string | null;
  favicon: string | null;
}

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? "bg-orange-500" : "bg-slate-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    emailVerificationRequired: true,
    allowGoogleLogin: false,
    allowSignup: true,
    logo: null,
    favicon: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [mediaTarget, setMediaTarget] = useState<"logo" | "favicon" | null>(null);

  const flash = (text: string, ok = true) => { setMessage({ text, ok }); setTimeout(() => setMessage(null), 3000); };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setSettings({ ...d });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailVerificationRequired: settings.emailVerificationRequired,
          allowGoogleLogin: settings.allowGoogleLogin,
          allowSignup: settings.allowSignup,
          logo: settings.logo,
          favicon: settings.favicon,
        }),
      });
      if (res.ok) flash("Settings saved");
      else { const d = await res.json(); flash(d.error || "Save failed", false); }
    } catch { flash("Save failed", false); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
            <MdSettings />
          </div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-xl text-slate-900 font-semibold text-sm transition-colors"
        >
          <MdSave /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <div className={`text-sm rounded-xl px-4 py-3 ${message.ok ? "bg-green-500/15 border border-green-500/25 text-green-300" : "bg-red-500/15 border border-red-500/25 text-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Site Branding */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Site Branding</h2>

        {/* Logo */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Logo</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-14 rounded-xl border border-white/10 bg-slate-900/60 flex items-center justify-center overflow-hidden shrink-0">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="max-h-12 max-w-full object-contain" />
              ) : (
                <MdImage className="text-slate-600 text-2xl" />
              )}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setMediaTarget("logo")}
                className="text-sm bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-white/10 px-4 py-2 rounded-xl transition-colors"
              >
                {settings.logo ? "Change Logo" : "Pick Logo from Media"}
              </button>
              {settings.logo && (
                <button onClick={() => setSettings((s) => ({ ...s, logo: null }))} className="block text-xs text-red-400 hover:underline">Remove</button>
              )}
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Favicon</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl border border-white/10 bg-slate-900/60 flex items-center justify-center overflow-hidden shrink-0">
              {settings.favicon ? (
                <img src={settings.favicon} alt="Favicon" className="w-10 h-10 object-contain" />
              ) : (
                <MdImage className="text-slate-600 text-xl" />
              )}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setMediaTarget("favicon")}
                className="text-sm bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-white/10 px-4 py-2 rounded-xl transition-colors"
              >
                {settings.favicon ? "Change Favicon" : "Pick Favicon from Media"}
              </button>
              {settings.favicon && (
                <button onClick={() => setSettings((s) => ({ ...s, favicon: null }))} className="block text-xs text-red-400 hover:underline">Remove</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-6 space-y-1 divide-y divide-white/5">
        <h2 className="text-sm font-semibold text-white pb-3">Platform Settings</h2>
        <Toggle
          checked={settings.allowSignup}
          onChange={(v) => setSettings((s) => ({ ...s, allowSignup: v }))}
          label="Allow new signups"
          description="When off, the signup page returns an error for new registrations."
        />
        <Toggle
          checked={settings.emailVerificationRequired}
          onChange={(v) => setSettings((s) => ({ ...s, emailVerificationRequired: v }))}
          label="Require email verification"
          description="New accounts must verify their email before accessing the platform."
        />
        <Toggle
          checked={settings.allowGoogleLogin}
          onChange={(v) => setSettings((s) => ({ ...s, allowGoogleLogin: v }))}
          label="Allow Google login"
          description="Show the 'Continue with Google' button on auth pages (OAuth must be configured)."
        />
      </div>

      {/* Media picker modal */}
      {mediaTarget && (
        <MediaBrowser
          open={true}
          onClose={() => setMediaTarget(null)}
          onSelect={(media) => {
            setSettings((s) => ({ ...s, [mediaTarget]: media.url }));
            setMediaTarget(null);
          }}
          allowAllMedia={true}
          mode="modal"
        />
      )}
    </div>
  );
}
