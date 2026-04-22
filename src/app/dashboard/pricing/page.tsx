"use client";

import { useState, useEffect } from "react";
import { MdBarChart, MdAdd, MdEdit, MdDelete, MdClose, MdCheck } from "react-icons/md";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  features: string;
  active: boolean;
  featured: boolean;
  activeCount: number;
  totalCount: number;
  revenue: number;
}

interface Stats {
  totalActive: number;
  totalLifetime: number;
  totalRevenue: number;
}

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

function durationLabel(d: number) {
  if (d === -1) return "Lifetime";
  if (d === 30) return "Monthly";
  if (d === 365) return "Yearly";
  return `${d} days`;
}

function parseFeatures(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return raw ? [raw] : []; }
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", currency: "USD", duration: "30", features: "", active: true, featured: false });

  const flash = (text: string, ok = true) => { setMessage({ text, ok }); setTimeout(() => setMessage(null), 3000); };

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const d = await res.json();
      if (d.plans) { setPlans(d.plans); setStats(d.stats); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditPlan(null);
    setForm({ name: "", description: "", price: "", currency: "USD", duration: "30", features: "", active: true, featured: false });
    setShowForm(true);
  }

  function openEdit(p: Plan) {
    setEditPlan(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      currency: p.currency,
      duration: String(p.duration),
      features: parseFeatures(p.features).join("\n"),
      active: p.active,
      featured: p.featured,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) { flash("Name and price are required", false); return; }
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      currency: form.currency,
      duration: Number(form.duration),
      features: JSON.stringify(form.features.split("\n").map((s) => s.trim()).filter(Boolean)),
      active: form.active,
      featured: form.featured,
    };
    try {
      const url = editPlan ? `/api/admin/plans/${editPlan.id}` : "/api/admin/plans";
      const method = editPlan ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (res.ok) { flash(editPlan ? "Plan updated" : "Plan created"); setShowForm(false); load(); }
      else flash(d.error || "Failed", false);
    } catch { flash("Failed", false); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this pricing plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (res.ok) { flash("Plan deleted"); load(); }
      else flash(d.error || "Delete failed", false);
    } catch { flash("Delete failed", false); }
  }

  async function toggleActive(p: Plan) {
    try {
      await fetch(`/api/admin/plans/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !p.active }) });
      load();
    } catch { /* ignore */ }
  }

  const totalRevenue = stats?.totalRevenue ?? 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
            <MdBarChart />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pricing Plans</h1>
            <p className="text-xs text-slate-400">{plans.length} plans configured</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-400 rounded-xl text-slate-900 font-semibold text-sm transition-colors">
          <MdAdd /> New Plan
        </button>
      </div>

      {message && (
        <div className={`text-sm rounded-xl px-4 py-3 ${message.ok ? "bg-green-500/15 border border-green-500/25 text-green-300" : "bg-red-500/15 border border-red-500/25 text-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Subscriptions", value: stats.totalActive },
            { label: "Lifetime Members", value: stats.totalLifetime },
            { label: "Recurring", value: stats.totalActive - stats.totalLifetime },
            { label: "Plans", value: plans.length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-slate-800/50 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Plans table */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-14 space-y-3">
            <p className="text-slate-400 text-sm">No pricing plans yet.</p>
            <button onClick={openCreate} className="text-orange-400 text-sm hover:underline">Create your first plan</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Plan</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Duration</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Subscribers</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Est. Revenue</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{p.name}</span>
                      {p.featured && <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25 px-1.5 py-0.5 rounded-full">Featured</span>}
                    </div>
                    {p.description && <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{p.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-white font-semibold">
                    {p.price === 0 ? "Free" : `$${p.price}`}
                    <span className="text-slate-500 font-normal text-xs ml-1">{p.currency}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 hidden sm:table-cell">{durationLabel(p.duration)}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-white">{p.activeCount}</span>
                    <span className="text-slate-500 text-xs ml-1">/ {p.totalCount} total</span>
                  </td>
                  <td className="px-5 py-3 text-slate-300 hidden lg:table-cell">${p.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(p)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${p.active ? "bg-green-500/15 text-green-300 border-green-500/25 hover:bg-green-500/25" : "bg-slate-700/60 text-slate-400 border-slate-600/40 hover:bg-slate-700"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-colors"><MdEdit /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{editPlan ? "Edit Plan" : "New Pricing Plan"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><MdClose size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Plan Name</label>
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Pro Monthly" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Short description" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} placeholder="99" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))} className={inputCls}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BDT">BDT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Duration</label>
                <select value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))} className={inputCls}>
                  <option value="30">Monthly (30 days)</option>
                  <option value="365">Yearly (365 days)</option>
                  <option value="-1">Lifetime</option>
                  <option value="7">Weekly (7 days)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm((s) => ({ ...s, features: e.target.value }))} placeholder={"Unlimited listings\nPriority support\nAll future features"} rows={4} className={inputCls + " resize-none"} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))} className="accent-orange-500" />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))} className="accent-orange-500" />
                  <span className="text-sm text-slate-300">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm text-slate-300">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl text-sm text-slate-900 font-semibold">
                {saving ? "Saving…" : editPlan ? "Save Changes" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
