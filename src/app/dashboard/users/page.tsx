// src/app/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { MdPeople, MdDelete, MdEdit, MdClose, MdSearch } from "react-icons/md";

type User = { id: string; name?: string | null; email: string; role: string; verified: boolean; createdAt: string };

const CUSTOMER_ROLES = ["USER", "BUYER", "EXPERT"];

const ROLE_BADGE: Record<string, string> = {
  USER:   "bg-slate-700/60 text-slate-300 border-slate-600/40",
  BUYER:  "bg-blue-500/15 text-blue-300 border-blue-500/25",
  EXPERT: "bg-orange-500/15 text-orange-300 border-orange-500/25",
};

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const d = await res.json();
      if (d.ok) setUsers(d.users.filter((u: User) => CUSTOMER_ROLES.includes(u.role)));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("User created");
        setForm({ name: "", email: "", password: "", role: "USER" });
        await loadUsers();
      } else {
        setMessage(data.error || "Create failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Create failed");
    } finally {
      setCreating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("Deleted");
        await loadUsers();
      } else {
        setMessage(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleRoleSwitch(id: string, newRole: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("Role updated");
        await loadUsers();
      } else {
        setMessage(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Update failed");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function startEdit(user: User) {
    setEditingId(user.id);
    setForm({ name: user.name || "", email: user.email, password: "", role: user.role });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: form.name, email: form.email, role: form.role }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("Updated");
        setEditingId(null);
        setForm({ name: "", email: "", password: "", role: "USER" });
        await loadUsers();
      } else {
        setMessage(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Update failed");
    } finally {
      setCreating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (u.name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl"><MdPeople /></div>
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-xs text-slate-400">{users.length} customer accounts</p>
        </div>
      </div>

      {message && (
        <div className={`text-sm rounded-xl px-4 py-3 ${message.ok ? "bg-green-500/15 border border-green-500/25 text-green-300" : "bg-red-500/15 border border-red-500/25 text-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-3">
        {CUSTOMER_ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
            className={`rounded-xl border p-3 text-center transition-colors ${roleFilter === r ? "border-orange-500/40 bg-orange-500/10" : "border-white/8 bg-slate-800/50 hover:bg-slate-700/50"}`}
          >
            <p className="text-lg font-bold text-white">{users.filter((u) => u.role === r).length}</p>
            <p className="text-xs text-slate-400 mt-0.5">{r}</p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">{editingId ? "Edit User" : "Create User"}</h3>
            {editingId && <button onClick={cancelEdit} className="text-slate-500 hover:text-white"><MdClose /></button>}
          </div>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-3">
            <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Name" className={inputCls} />
            <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" type="email" className={inputCls} required />
            {!editingId && (
              <input
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="Password"
                type="password"
                className="w-full border rounded px-3 py-2"
                required
              />
            )}
            <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} className={inputCls}>
              {CUSTOMER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

        {/* Table */}
        <div className="md:col-span-2 space-y-3">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 flex-1">
              <MdSearch className="text-slate-500 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
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
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-2.5">
                        <div>
                          <p className="text-white font-medium text-sm">{u.name || "—"}</p>
                          {u.verified && <p className="text-xs text-green-400">verified</p>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <select value={u.role} onChange={(e) => handleRoleSwitch(u.id, e.target.value)}
                          className="bg-slate-900/60 border border-white/10 text-xs text-white rounded-lg px-2 py-1 outline-none">
                          {CUSTOMER_ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => startEdit(u)} className="text-slate-500 hover:text-orange-400 transition-colors"><MdEdit /></button>
                          <button onClick={() => handleDelete(u.id)} className="text-slate-500 hover:text-red-400 transition-colors"><MdDelete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-slate-500 text-sm">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
