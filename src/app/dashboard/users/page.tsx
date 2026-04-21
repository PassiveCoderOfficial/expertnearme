// src/app/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name?: string | null;
  email: string;
  role: "ADMIN" | "EXPERT" | "USER";
  verified: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.ok) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  return (
    <main>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1 p-4 border rounded">
          <h3 className="font-semibold mb-2">{editingId ? "Edit User" : "Create User"}</h3>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Name"
              className="w-full border rounded px-3 py-2"
              required={!editingId}
            />
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="Email"
              type="email"
              className="w-full border rounded px-3 py-2"
              required
            />
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
            <select
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="USER">USER</option>
              <option value="EXPERT">EXPERT</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="px-3 py-2 bg-[#b84c4c] text-white rounded">
                {creating ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", password: "", role: "USER" }); }} className="px-3 py-2 border rounded">
                  Cancel
                </button>
              )}
            </div>
            {message && <div className="text-sm text-green-600">{message}</div>}
          </form>
        </section>

        <section className="md:col-span-2 p-4 border rounded">
          <h3 className="font-semibold mb-2">All Users</h3>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2">{u.name || "-"}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} onChange={(e) => handleRoleSwitch(u.id, e.target.value)} className="border rounded px-2 py-1">
                        <option value="USER">USER</option>
                        <option value="EXPERT">EXPERT</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>{u.verified ? "Yes" : "No"}</td>
                    <td className="py-2">
                      <button onClick={() => startEdit(u)} className="mr-2 text-sm px-2 py-1 border rounded">Edit</button>
                      <button onClick={() => handleDelete(u.id)} className="text-sm px-2 py-1 border rounded text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
