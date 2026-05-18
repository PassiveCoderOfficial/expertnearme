'use client';

import { useState } from 'react';
import { Mail, MessageCircle, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import type { Metadata } from 'next';

// Note: metadata export doesn't work in 'use client' — use layout or separate file if needed.
// For now the page title is set via the head tag approach below.

const CONTACT_TYPES = [
  { value: 'GENERAL', label: 'General question' },
  { value: 'BILLING', label: 'Billing / payment' },
  { value: 'TECHNICAL', label: 'Technical issue' },
  { value: 'EXPERT_LISTING', label: 'Expert listing help' },
  { value: 'OTHER', label: 'Other' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', type: 'GENERAL', subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Something went wrong.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Get in Touch</p>
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">We're here to help.</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Questions about listing your business, payment issues, or anything else — send us a message and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">

          {/* Contact options */}
          <div className="md:col-span-2 space-y-4">
            <a
              href="https://wa.me/8801678669699?text=Hi%2C+I+have+a+question+about+ExpertNear.Me"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/40 hover:border-green-300 dark:hover:border-green-500/30 p-5 transition-all shadow-sm dark:shadow-none"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm mb-0.5">WhatsApp</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">+880 167 866 9699</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Usually replies within 1 hour
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-green-500 ml-auto self-center shrink-0 transition-colors" />
            </a>

            <a
              href="mailto:support@expertnear.me"
              className="group flex items-start gap-4 rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/40 hover:border-orange-200 dark:hover:border-orange-500/30 p-5 transition-all shadow-sm dark:shadow-none"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/15 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm mb-0.5">Email</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">support@expertnear.me</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Response within 24 hours
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 ml-auto self-center shrink-0 transition-colors" />
            </a>

            <div className="rounded-2xl border border-orange-200 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/8 p-5">
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">Founding Expert?</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                For payment confirmation or account activation, WhatsApp is fastest. Include your email and payment reference.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border border-green-200 dark:border-green-500/25 bg-green-50 dark:bg-green-500/10 p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Message sent!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We'll get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/40 p-8 shadow-sm dark:shadow-none space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name</label>
                    <input
                      required value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                    <input
                      required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Type</label>
                  <select
                    value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-colors"
                  >
                    {CONTACT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Subject</label>
                  <input
                    required value={form.subject} onChange={e => set('subject', e.target.value)}
                    placeholder="Brief summary"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Message</label>
                  <textarea
                    required rows={5} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-orange-500/20"
                >
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
