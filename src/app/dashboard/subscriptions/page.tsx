"use client";

import { useEffect, useState } from "react";
import { MdRefresh, MdDownload, MdAdd, MdClose, MdSearch } from "react-icons/md";

type Plan = { id: number; name: string; price: number; currency: string; duration: number };
type Sub = {
  id: number;
  status: string;
  isLifetime: boolean;
  gateway: string | null;
  paymentRef: string | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string; role: string };
  plan: Plan;
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    "bg-green-500/15 text-green-300 border-green-500/25",
  EXPIRED:   "bg-red-500/15 text-red-300 border-red-500/25",
  CANCELLED: "bg-slate-700 text-slate-400 border-slate-600",
  PAUSED:    "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
};

const GATEWAY_LABEL: Record<string, string> = {
  paddle: "Paddle",
  lemonsqueezy: "LemonSqueezy",
  surjopay: "SurjoPay",
};

export default function SubscriptionsPage() {
  const [subs, setSubs]       = useState<Sub[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState("");
  const [gateway, setGateway] = useState("");
  const [search, setSearch]   = useState("");
  const [plans, setPlans]     = useState<Plan[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ userId: "", planId: "", cycles: 1, paymentRef: "", gateway: "manual" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  // Expert search state
  const [expertQuery, setExpertQuery]     = useState("");
  const [expertResults, setExpertResults] = useState<{ id: number; userId: number | null; name: string; email: string; businessName?: string }[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<{ id: number; label: string } | null>(null);
  const [expertSearching, setExpertSearching] = useState(false);

  const load = async (p = page, s = status, g = gateway) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (s) params.set("status", s);
    if (g) params.set("gateway", g);
    const r = await fetch(`/api/admin/subscriptions?${params}`);
    const d = await r.json();
    setSubs(d.subscriptions || []);
    setTotal(d.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { fetch("/api/admin/plans").then(r=>r.json()).then(d=>setPlans(Array.isArray(d.plans)?d.plans:[])).catch(()=>{}); }, []);

  const handleFilter = () => { setPage(1); load(1, status, gateway); };

  const searchExperts = async (q: string) => {
    setExpertQuery(q);
    if (q.length < 2) { setExpertResults([]); return; }
    setExpertSearching(true);
    try {
      const r = await fetch(`/api/dashboard/experts?search=${encodeURIComponent(q)}&limit=8`);
      const d = await r.json();
      setExpertResults(Array.isArray(d) ? d : []);
    } catch { setExpertResults([]); }
    finally { setExpertSearching(false); }
  };

  const selectExpert = (e: { id: number; userId: number | null; name: string; email: string; businessName?: string }) => {
    const label = `${e.businessName || e.name} — ${e.email}`;
    const uid = e.userId ?? e.id; // fallback to expert id if no user found
    setSelectedExpert({ id: uid, label });
    setForm(prev => ({ ...prev, userId: String(uid) }));
    setExpertQuery(label);
    setExpertResults([]);
  };

  const handleAdd = async () => {
    if (!form.userId || !form.planId) { setError("Expert and plan are required"); return; }
    setSaving(true); setError("");
    const r = await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(form.userId), planId: Number(form.planId), cycles: form.cycles, paymentRef: form.paymentRef, gateway: form.gateway }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Failed"); setSaving(false); return; }
    setShowAdd(false);
    setForm({ userId: "", planId: "", cycles: 1, paymentRef: "", gateway: "manual" });
    setExpertQuery(""); setSelectedExpert(null); setExpertResults([]);
    load(1, status, gateway);
    setSaving(false);
  };

  const handleStatus = async (id: number, newStatus: string) => {
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load(page, status, gateway);
  };

  const exportCsv = () => {
    const rows = [
      ["ID","User","Email","Plan","Status","Gateway","Lifetime","Starts","Ends"],
      ...subs.map(s => [
        s.id, s.user.name, s.user.email, s.plan.name, s.status,
        s.gateway||"", s.isLifetime?"Yes":"No",
        new Date(s.startsAt).toLocaleDateString(),
        s.endsAt ? new Date(s.endsAt).toLocaleDateString() : "—",
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "subscriptions.csv";
    a.click();
  };

  const filtered = search
    ? subs.filter(s =>
        s.user.name.toLowerCase().includes(search.toLowerCase()) ||
        s.user.email.toLowerCase().includes(search.toLowerCase()) ||
        s.plan.name.toLowerCase().includes(search.toLowerCase())
      )
    : subs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total members</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/8 rounded-lg text-slate-300 text-sm transition-colors">
            <MdDownload className="text-base" /> Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-slate-900 font-semibold text-sm transition-colors">
            <MdAdd className="text-base" /> Add Manual
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active",    val: subs.filter(s=>s.status==="ACTIVE").length,    color: "text-green-400" },
          { label: "Lifetime",  val: subs.filter(s=>s.isLifetime).length,           color: "text-orange-400" },
          { label: "Expired",   val: subs.filter(s=>s.status==="EXPIRED").length,   color: "text-red-400" },
          { label: "Cancelled", val: subs.filter(s=>s.status==="CANCELLED").length, color: "text-slate-400" },
        ].map(c => (
          <div key={c.label} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
            <p className={`text-2xl font-bold ${c.color}`}>{c.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <MdSearch className="text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="">All Statuses</option>
          {["ACTIVE","EXPIRED","CANCELLED","PAUSED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={gateway} onChange={e => setGateway(e.target.value)} className="bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="">All Gateways</option>
          <option value="paddle">Paddle</option>
          <option value="lemonsqueezy">LemonSqueezy</option>
          <option value="surjopay">SurjoPay</option>
        </select>
        <button onClick={handleFilter} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/8 rounded-xl text-slate-300 text-sm transition-colors">
          <MdRefresh className="text-base" /> Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {["Member","Plan","Status","Gateway","Lifetime","Started","Expires","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No subscriptions found.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{s.user.name}</p>
                    <p className="text-xs text-slate-500">{s.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{s.plan.name}</p>
                    <p className="text-xs text-slate-500">{s.plan.currency} {s.plan.price}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[s.status] || STATUS_COLOR.CANCELLED}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{s.gateway ? GATEWAY_LABEL[s.gateway] || s.gateway : "—"}</td>
                  <td className="px-4 py-3">
                    {s.isLifetime ? <span className="text-xs text-orange-400 font-semibold">♾ Lifetime</span> : <span className="text-slate-600 text-xs">No</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(s.startsAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{s.endsAt ? new Date(s.endsAt).toLocaleDateString() : <span className="text-slate-600">—</span>}</td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={s.status}
                      onChange={e => handleStatus(s.id, e.target.value)}
                      className="bg-slate-700 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none"
                    >
                      {["ACTIVE","EXPIRED","CANCELLED","PAUSED"].map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 25 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
            <p className="text-xs text-slate-500">Showing {Math.min((page-1)*25+1, total)}–{Math.min(page*25, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={() => { setPage(p=>p-1); load(page-1,status,gateway); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-white/8 rounded-lg text-xs text-slate-300 transition-colors">Prev</button>
              <button disabled={page*25>=total} onClick={() => { setPage(p=>p+1); load(page+1,status,gateway); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-white/8 rounded-lg text-xs text-slate-300 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add manual modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Add Manual Subscription</h2>
              <button onClick={() => { setShowAdd(false); setExpertQuery(""); setSelectedExpert(null); setExpertResults([]); }} className="text-slate-400 hover:text-white"><MdClose size={20} /></button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Expert search */}
            <div className="relative">
              <label className="block text-xs text-slate-400 mb-1">Expert / Member</label>
              <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl px-3 py-2">
                <MdSearch className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={expertQuery}
                  onChange={e => searchExperts(e.target.value)}
                  placeholder="Search by name, email or phone…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
                {expertSearching && <div className="w-3 h-3 rounded-full border border-orange-500 border-t-transparent animate-spin shrink-0" />}
              </div>
              {expertResults.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  {expertResults.map(e => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => selectExpert(e)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-700 transition-colors border-b border-white/5 last:border-0"
                    >
                      <p className="text-sm text-white font-medium">{e.businessName || e.name}</p>
                      <p className="text-xs text-slate-400">{e.email} · User #{e.userId ?? "⚠ no user"}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedExpert && (
                <p className="text-xs text-green-400 mt-1">✓ Selected: {selectedExpert.label} (ID {selectedExpert.id})</p>
              )}
            </div>

            {/* Plan */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Plan</label>
              <select
                value={form.planId}
                onChange={e => setForm(prev => ({ ...prev, planId: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40"
                style={{ colorScheme: "dark" }}
              >
                <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>Select plan…</option>
                {plans.map((p: Plan) => (
                  <option key={p.id} value={p.id} style={{ background: "#1e293b", color: "#f1f5f9" }}>
                    {p.name} — {p.currency} {p.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment reference */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Payment Reference</label>
              <input
                type="text"
                value={form.paymentRef}
                onChange={e => setForm(prev => ({ ...prev, paymentRef: e.target.value }))}
                placeholder="e.g. bank transfer ref, cheque no."
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40"
              />
            </div>

            {/* Billing cycles */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Billing Cycles</label>
              <input
                type="number"
                min={1}
                value={form.cycles}
                onChange={e => setForm(prev => ({ ...prev, cycles: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40"
              />
              <p className="text-xs text-slate-500 mt-1">Number of billing periods (e.g. 1 = one plan duration). Set by plan manager for lifetime plans.</p>
            </div>

            {/* Gateway */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Gateway</label>
              <select
                value={form.gateway}
                onChange={e => setForm(prev => ({ ...prev, gateway: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40"
                style={{ colorScheme: "dark" }}
              >
                {[["manual","Manual / Cash"],["surjopay","SurjoPay"],["paddle","Paddle"],["lemonsqueezy","LemonSqueezy"]].map(([v,l]) => (
                  <option key={v} value={v} style={{ background: "#1e293b", color: "#f1f5f9" }}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setExpertQuery(""); setSelectedExpert(null); setExpertResults([]); }} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm text-slate-300 transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl text-sm text-slate-900 font-semibold transition-colors">
                {saving ? "Saving…" : "Add Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
