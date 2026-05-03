"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdClose, MdEdit, MdDelete, MdRefresh, MdSearch, MdAdminPanelSettings } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

type StaffRole = "MANAGER" | "MARKETER" | "SEO_EXPERT" | "SALES_AGENT" | "ADMIN" | "SUPER_ADMIN";

type StaffMember = {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  verified: boolean;
  createdAt: string;
};

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "MANAGER",     label: "Manager" },
  { value: "MARKETER",    label: "Marketer" },
  { value: "SEO_EXPERT",  label: "SEO Expert" },
  { value: "SALES_AGENT", label: "Sales Agent" },
  { value: "ADMIN",       label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/15 text-red-300 border-red-500/25",
  ADMIN:       "bg-purple-500/15 text-purple-300 border-purple-500/25",
  MANAGER:     "bg-blue-500/15 text-blue-300 border-blue-500/25",
  MARKETER:    "bg-pink-500/15 text-pink-300 border-pink-500/25",
  SEO_EXPERT:  "bg-teal-500/15 text-teal-300 border-teal-500/25",
  SALES_AGENT: "bg-green-500/15 text-green-300 border-green-500/25",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  MANAGER:     "Manager",
  MARKETER:    "Marketer",
  SEO_EXPERT:  "SEO Expert",
  SALES_AGENT: "Sales Agent",
};

export default function StaffPage() {
  const { session } = useAuth();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [editItem, setEditItem] = useState<StaffMember | null>(null);
  const [delItem, setDelItem]   = useState<StaffMember | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MANAGER" as StaffRole });

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/staff");
    const d = await r.json();
    setStaff(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.email || !form.password) { setError("Email and password required"); return; }
    setSaving(true); setError("");
    const r = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Failed"); setSaving(false); return; }
    setShowAdd(false);
    setForm({ name: "", email: "", password: "", role: "MANAGER" });
    load();
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true); setError("");
    const r = await fetch(`/api/admin/staff/${editItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editItem.role, name: editItem.name }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Failed"); setSaving(false); return; }
    setEditItem(null);
    load();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!delItem) return;
    setSaving(true);
    await fetch(`/api/admin/staff/${delItem.id}`, { method: "DELETE" });
    setDelItem(null);
    load();
    setSaving(false);
  };

  const filtered = search
    ? staff.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase())
      )
    : staff;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff & Roles</h1>
          <p className="text-slate-400 text-sm mt-0.5">{staff.length} team members</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/8 rounded-lg text-slate-400 transition-colors">
            <MdRefresh />
          </button>
          <button
            onClick={() => { setShowAdd(true); setError(""); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-slate-900 font-semibold text-sm transition-colors"
          >
            <MdAdd /> Add Staff
          </button>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROLE_OPTIONS.map(r => {
          const count = staff.filter(s => s.role === r.value).length;
          return (
            <div key={r.value} className="bg-slate-800/60 border border-white/8 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${ROLE_COLOR[r.value]?.split(" ")[1] || "text-white"}`}>{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 max-w-xs">
        <MdSearch className="text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search staff…"
          className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {["Member", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <MdAdminPanelSettings className="text-4xl text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No staff members found.</p>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-white/10 flex items-center justify-center text-sm font-bold text-orange-400 shrink-0">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLOR[s.role] || "bg-slate-700 text-slate-400 border-slate-600"}`}>
                      {ROLE_LABEL[s.role] || s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditItem({ ...s }); setError(""); }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
                        title="Edit role"
                      >
                        <MdEdit />
                      </button>
                      {(isSuperAdmin || (session?.role === "ADMIN" && s.role !== "SUPER_ADMIN" && s.role !== "ADMIN")) && (
                        <button
                          onClick={() => setDelItem(s)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove staff"
                        >
                          <MdDelete />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Add Staff Member</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><MdClose size={20} /></button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith" },
              { label: "Email", key: "email", type: "email", placeholder: "jane@example.com" },
              { label: "Password", key: "password", type: "password", placeholder: "min 8 characters" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as StaffRole }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none"
              >
                {ROLE_OPTIONS.filter(r => isSuperAdmin || (r.value !== "SUPER_ADMIN" && r.value !== "ADMIN")).map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm text-slate-300">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl text-sm text-slate-900 font-semibold">
                {saving ? "Adding…" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Edit Staff Member</h2>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-white"><MdClose size={20} /></button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name</label>
              <input
                value={editItem.name}
                onChange={e => setEditItem(p => p ? { ...p, name: e.target.value } : p)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/40"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <select
                value={editItem.role}
                onChange={e => setEditItem(p => p ? { ...p, role: e.target.value as StaffRole } : p)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none"
              >
                {ROLE_OPTIONS.filter(r => isSuperAdmin || (r.value !== "SUPER_ADMIN")).map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditItem(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm text-slate-300">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl text-sm text-slate-900 font-semibold">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto">
              <MdDelete className="text-red-400 text-xl" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Remove Staff Member?</h2>
              <p className="text-slate-400 text-sm mt-1">
                <span className="text-white font-medium">{delItem.name}</span> will lose all staff access. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDelItem(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm text-slate-300">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-60 rounded-xl text-sm text-white font-semibold">
                {saving ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
