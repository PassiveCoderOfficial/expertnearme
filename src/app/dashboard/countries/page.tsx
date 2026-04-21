"use client";

import { useState, useEffect } from "react";
import { MdPublic, MdAdd, MdDelete, MdClose } from "react-icons/md";

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";
const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

const emptyForm = {
  code: "", name: "", active: "true", landingContent: "",
  currency: "USD", timezone: "UTC", phoneCode: "", flagEmoji: "",
  metaTitle: "", metaDesc: "",
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCountries(); }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/countries");
      if (res.ok) setCountries(await res.json());
      else setError("Failed to fetch countries");
    } catch { setError("Failed to fetch countries"); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData(emptyForm);
        fetchCountries();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to add country");
      }
    } catch { setError("Failed to add country"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete country "${code}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/dashboard/countries?code=${code}`, { method: "DELETE" });
      if (res.ok) fetchCountries();
      else { const d = await res.json(); setError(d.error || "Failed to delete"); }
    } catch { setError("Failed to delete country"); }
  };

  const set = (key: string, val: string) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
            <MdPublic />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Countries</h1>
            <p className="text-xs text-slate-400">{countries.length} configured</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          {showForm ? <><MdClose /> Cancel</> : <><MdAdd /> Add Country</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-white/8 bg-slate-800/60 p-6">
          <h2 className="text-base font-semibold text-white mb-5">Add New Country</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Country Code <span className="text-slate-600">(2-4 letters)</span></label>
                <input type="text" value={formData.code} onChange={(e) => set("code", e.target.value)} className={inputCls} maxLength={4} placeholder="e.g. bd" required />
              </div>
              <div>
                <label className={labelCls}>Country Name</label>
                <input type="text" value={formData.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Bangladesh" required />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Active</label>
                <select value={formData.active} onChange={(e) => set("active", e.target.value)} className={inputCls}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <input type="text" value={formData.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls} placeholder="USD" />
              </div>
              <div>
                <label className={labelCls}>Timezone</label>
                <input type="text" value={formData.timezone} onChange={(e) => set("timezone", e.target.value)} className={inputCls} placeholder="UTC" />
              </div>
              <div>
                <label className={labelCls}>Phone Code</label>
                <input type="text" value={formData.phoneCode} onChange={(e) => set("phoneCode", e.target.value)} className={inputCls} placeholder="+880" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Flag Emoji</label>
                <input type="text" value={formData.flagEmoji} onChange={(e) => set("flagEmoji", e.target.value)} className={inputCls} placeholder="🇧🇩" />
              </div>
              <div>
                <label className={labelCls}>Meta Title</label>
                <input type="text" value={formData.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} placeholder="Experts in Bangladesh" />
              </div>
              <div>
                <label className={labelCls}>Meta Description</label>
                <input type="text" value={formData.metaDesc} onChange={(e) => set("metaDesc", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? "Adding…" : "Add Country"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-white/10 text-slate-400 hover:text-white px-5 py-2 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-14 text-slate-500 text-sm">No countries configured yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Currency</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Timezone</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Phone Code</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c: any) => (
                <tr key={c.code} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-orange-400 uppercase text-xs">{c.code}</td>
                  <td className="px-5 py-3 text-white font-medium">{c.flagEmoji} {c.name}</td>
                  <td className="px-5 py-3 text-slate-400 hidden sm:table-cell">{c.currency}</td>
                  <td className="px-5 py-3 text-slate-400 hidden md:table-cell text-xs">{c.timezone}</td>
                  <td className="px-5 py-3 text-slate-400 hidden md:table-cell">{c.phoneCode || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.active ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-slate-700 text-slate-400"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(c.code)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <MdDelete /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
