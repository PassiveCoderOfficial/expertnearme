"use client";

import { useEffect, useState } from "react";
import { MdPeople, MdDelete, MdEdit, MdClose } from "react-icons/md";

type User = { id: string; name?: string | null; email: string; role: string; verified: boolean; createdAt: string };

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok = true) => { setMessage({ text, ok }); setTimeout(() => setMessage(null), 3000); };

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const d = await res.json();
      if (d.ok) setUsers(d.users);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.ok) { flash("User created"); setForm({ name: "", email: "", password: "", role: "USER" }); loadUsers(); }
      else flash(d.error || "Create failed", false);
    } catch { flash("Create failed", false); }
    finally { setSaving(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault(); if (!editingId) return; setSaving(true);
    try {
      const res = await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, name: form.name, email: form.email, role: form.role }) });
      const d = await res.json();
      if (d.ok) { flash("Updated"); cancelEdit(); loadUsers(); }
      else flash(d.error || "Update failed", false);
    } catch { flash("Update failed", false); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const d = await res.json();
      if (d.ok) { flash("Deleted"); loadUsers(); } else flash(d.error || "Delete failed", false);
    } catch { flash("Delete failed", false); }
  }

  async function handleRoleSwitch(id: string, role: string) {
    try {
      const res = await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
      const d = await res.json();
      if (d.ok) { flash("Role updated"); loadUsers(); } else flash(d.error || "Failed", false);
    } catch { flash("Failed", false); }
  }

  function startEdit(u: User) {
    setEditingId(u.id);
    setForm({ name: u.name || "", email: u.email, password: "", role: u.role });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", email: "", password: "", role: "USER" });
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl"><MdPeople /></div>
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-xs text-slate-400">{users.length} total</p>
        </div>
      </div>

      {message && (
        <div className={`text-sm rounded-xl px-4 py-3 ${message.ok ? "bg-green-500/15 border border-green-500/25 text-green-300" : "bg-red-500/15 border border-red-500/25 text-red-300"}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">{editingId ? "Edit User" : "Create User"}</h3>
            {editingId && <button onClick={cancelEdit} className="text-slate-500 hover:text-white"><MdClose /></button>}
          </div>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-3">
            <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Name" className={inputCls} required={!editingId} />
            <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" type="email" className={inputCls} required />
            {!editingId && (
              <input value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Password" type="password" className={inputCls} required />
            )}
            <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} className={inputCls}>
              <option value="USER">USER</option>
              <option value="EXPERT">EXPERT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-50">
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="md:col-span-2 rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 text-white font-medium text-sm">{u.name || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <select value={u.role} onChange={(e) => handleRoleSwitch(u.id, e.target.value)}
                        className="bg-slate-900/60 border border-white/10 text-xs text-white rounded-lg px-2 py-1 outline-none">
                        <option>USER</option><option>EXPERT</option><option>ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 flex gap-2 justify-end">
                      <button onClick={() => startEdit(u)} className="text-slate-500 hover:text-orange-400 transition-colors"><MdEdit /></button>
                      <button onClick={() => handleDelete(u.id)} className="text-slate-500 hover:text-red-400 transition-colors"><MdDelete /></button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-500 text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
