"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, LifeBuoy } from "lucide-react";

const TYPES = [
  { value: "BUG", label: "Bug Report" },
  { value: "FEATURE", label: "Feature Request" },
  { value: "BILLING", label: "Billing Issue" },
  { value: "OTHER", label: "Other" },
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "BUG", subject: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to submit. Please try again.");
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Ticket Submitted</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We&apos;ve received your request and will get back to you at <strong className="text-slate-700 dark:text-slate-200">{form.email}</strong> shortly.
          </p>
          <button
            onClick={() => { setDone(false); setForm({ name: "", email: "", type: "BUG", subject: "", description: "" }); }}
            className="mt-6 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            Submit another ticket
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/15 flex items-center justify-center mb-5">
            <LifeBuoy className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Help Center</p>
          <h1 className="text-3xl font-bold mb-3">Support & Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Found a bug? Want a new feature? We read every message. Average response time: 24h.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Your Name *</label>
              <input
                required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Email *</label>
              <input
                required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Request Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value} type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    form.type === t.value
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-orange-400 dark:hover:border-orange-500/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Subject *</label>
            <input
              required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Brief summary of your request"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description *</label>
            <textarea
              required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={5}
              placeholder={form.type === "BUG" ? "Steps to reproduce, expected vs actual behavior..." : form.type === "FEATURE" ? "Describe the feature and why it would help..." : "Describe your issue in detail..."}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-orange-500/20"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Ticket"}
          </button>
        </form>
      </div>
    </main>
  );
}
