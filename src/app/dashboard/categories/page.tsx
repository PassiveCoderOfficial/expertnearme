// File: src/app/dashboard/categories/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

type Cat = { id: number; name: string; slug: string; countryCode: string; parentId: number | null; children?: Cat[]; showOnHomepage?: boolean };
type Country = { code: string; name: string };

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";
const toSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function DashboardCategoriesPage() {
  const { session } = useAuth();
  const { toast } = useToast();

  const [tree, setTree] = useState<Cat[]>([]);
  const [flat, setFlat] = useState<Cat[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [adding, setAdding] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newParentId, setNewParentId] = useState<number | "">("");
  const [newShowOnHomepage, setNewShowOnHomepage] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState<number | "">("");
  const [editShowOnHomepage, setEditShowOnHomepage] = useState(false);

  // UI feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // slug helper
  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  // Fetch categories (admin endpoint)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to fetch categories");
      }
      const data: Cat[] = await res.json();
      setTree(data);

      // Flatten for parent dropdown (preserve hierarchy with prefix)
      const flatten = (nodes: Cat[], acc: Cat[] = [], depth = 0) => {
        nodes.forEach((n) => {
          acc.push({ ...n, name: `${"- ".repeat(depth)}${n.name}` });
          if (n.children && n.children.length) flatten(n.children, acc, depth + 1);
        });
        return acc;
      };
      setFlat(flatten(data));
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/countries");
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    if (session?.role === "ADMIN") { fetchCategories(); fetchCountries(); }
    else setLoading(false);
  }, [session?.role]);

  // Add category
  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim() || toSlug(newName),
          countryCode: newCountryCode,
          parentId: newParentId === "" ? null : Number(newParentId),
          showOnHomepage: Boolean(newShowOnHomepage),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "Failed");
      setSuccess(`"${d.category.name}" added`);
      setNewName(""); setNewSlug(""); setNewCountryCode(""); setNewParentId(""); setNewShowOnHomepage(false);
      await fetchCategories(); toast("Category added", { type: "success" });
    } catch (e: any) { setError(e?.message || "Error"); toast("Failed", { type: "error" }); }
    finally { setAdding(false); }
  };

  // Start editing
  const startEdit = (cat: Cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditParentId(cat.parentId ?? "");
    setEditShowOnHomepage(Boolean(cat.showOnHomepage));
    setError(null);
    setSuccess(null);
  };

  // Update category
  const handleUpdate = async () => {
    if (!editingId) return;
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: editName.trim(),
        slug: editSlug.trim() || toSlug(editName),
        parentId: editParentId === "" ? null : Number(editParentId),
        showOnHomepage: Boolean(editShowOnHomepage),
      };
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update category");
      setSuccess(`Category "${data.name}" updated`);
      setEditingId(null);
      setEditName("");
      setEditSlug("");
      setEditParentId("");
      setEditShowOnHomepage(false);
      await fetchCategories();
      toast("Category updated", { type: "success" });
    } catch (err: any) {
      console.error("Update category error:", err);
      setError(err?.message || "Network error");
      toast("Failed to update category", { type: "error" });
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete category");
      setSuccess("Category deleted");
      await fetchCategories();
      toast("Category deleted", { type: "success" });
    } catch (err: any) {
      console.error("Delete category error:", err);
      setError(err?.message || "Network error");
      toast("Failed to delete category", { type: "error" });
    }
  };

  // Toggle showOnHomepage
  const handleToggleShowOnHomepage = async (cat: Cat) => {
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        showOnHomepage: !Boolean(cat.showOnHomepage),
      };
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update category");
      setSuccess(`Category "${data.name}" updated`);
      await fetchCategories();
      toast("Category updated", { type: "success" });
    } catch (err: any) {
      console.error("Toggle showOnHomepage error:", err);
      setError(err?.message || "Network error");
      toast("Failed to update category", { type: "error" });
    }
  };

  // Filter flat list by country for parent dropdown in add form
  const flatForCountry = useMemo(() => flat.filter(c => !newCountryCode || c.countryCode === newCountryCode), [flat, newCountryCode]);

  // Filtered tree rows for table
  const filteredFlat = useMemo(() => filterCountry ? flat.filter(c => c.countryCode === filterCountry) : flat, [flat, filterCountry]);

  const rows = useMemo(() => {
    const r: React.ReactNode[] = [];
    const items = filterCountry ? filteredFlat : (() => { const acc: Cat[] = []; const walk = (nodes: Cat[], d = 0) => nodes.forEach(n => { acc.push(n); if (n.children?.length) walk(n.children, d + 1); }); walk(tree); return acc; })();

    items.forEach((cat) => {
      const depth = filterCountry ? 0 : (cat.name.match(/^(- )+/) || [""])[0].length / 2;
      const displayName = cat.name.replace(/^(- )+/, "");
      r.push(
        <tr key={cat.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
          <td className="px-4 py-2.5 text-slate-500 text-xs font-mono">{cat.id}</td>
          <td className="px-4 py-2.5">
            {editingId === cat.id ? (
              <input value={editName} onChange={(e) => { setEditName(e.target.value); setEditSlug(toSlug(e.target.value)); }} className={`${inputCls} py-1 text-xs`} />
            ) : (
              <span className="text-white text-sm" style={{ paddingLeft: depth * 12 }}>
                {depth > 0 && <span className="text-slate-600 mr-1">└</span>}{displayName}
              </span>
            )}
          </td>
          <td className="px-4 py-2.5">
            {editingId === cat.id ? (
              <input value={editSlug} onChange={(e) => setEditSlug(toSlug(e.target.value))} className={`${inputCls} py-1 text-xs`} />
            ) : (
              <span className="text-slate-400 text-xs font-mono">{cat.slug}</span>
            )}
          </td>
          <td className="px-4 py-2.5 hidden sm:table-cell">
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono uppercase">{cat.countryCode}</span>
          </td>
          <td className="px-4 py-2.5 hidden md:table-cell">
            {editingId === cat.id ? (
              <select value={editParentId ?? ""} onChange={(e) => setEditParentId(e.target.value === "" ? "" : Number(e.target.value))} className={`${inputCls} py-1 text-xs`}>
                <option value="">No parent</option>
                {flat.filter((p) => p.id !== cat.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <span className="text-slate-400 text-xs">{cat.parentId ? flat.find((p) => p.id === cat.parentId)?.name?.replace(/^-+\s*/, "") : "—"}</span>
            )}
          </td>
          <td className="px-4 py-2.5">
            <button onClick={() => handleToggleHomepage(cat)} className={`text-xs px-2 py-0.5 rounded-full border font-semibold transition-colors ${cat.showOnHomepage ? "bg-green-500/15 text-green-400 border-green-500/20" : "bg-slate-700 text-slate-500 border-white/10"}`}>
              {cat.showOnHomepage ? "Yes" : "No"}
            </button>
          </td>
          <td className="px-4 py-2.5">
            <div className="flex items-center gap-2">
              {editingId === cat.id ? (
                <>
                  <button onClick={handleUpdate} className="text-green-400 hover:text-green-300 transition-colors"><MdCheck /></button>
                  <button onClick={cancelEdit} className="text-slate-500 hover:text-white transition-colors"><MdClose /></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(cat)} className="text-slate-500 hover:text-orange-400 transition-colors"><MdEdit /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-500 hover:text-red-400 transition-colors"><MdDelete /></button>
                </>
              )}
            </div>
          </td>
        </tr>
      );
    });
    return r;
  }, [tree, flat, filteredFlat, filterCountry, editingId, editName, editSlug, editParentId, editShowOnHomepage]);

  // If not admin, show unauthorized
  if (session?.role !== "ADMIN") {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">You are not authorized to view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl"><MdCategory /></div>
          <div>
            <h1 className="text-xl font-bold text-white">Categories</h1>
            <p className="text-xs text-slate-400">{flat.length} total</p>
          </div>
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="bg-slate-800 border border-white/10 text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-orange-500/50">
          <option value="">All countries</option>
          {countries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code.toUpperCase()})</option>)}
        </select>
      </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(toSlug(e.target.value))}
            placeholder="health / legal / it"
            className="border p-2 w-full"
            required
          />
        </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="rounded-2xl border border-white/8 bg-slate-800/50 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><MdAdd /> Add Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(toSlug(e.target.value)); }} placeholder="Name *" className={inputCls} required />
          <input type="text" value={newSlug} onChange={(e) => setNewSlug(toSlug(e.target.value))} placeholder="Slug (auto)" className={inputCls} />
          <select value={newCountryCode} onChange={(e) => { setNewCountryCode(e.target.value); setNewParentId(""); }} className={inputCls} required>
            <option value="">Country *</option>
            {countries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code.toUpperCase()})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={newParentId} onChange={(e) => setNewParentId(e.target.value === "" ? "" : Number(e.target.value))} className={inputCls}>
            <option value="">No parent</option>
            {flatForCountry.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={newShowOnHomepage} onChange={(e) => setNewShowOnHomepage(e.target.checked)} className="rounded accent-orange-500" />
              Show on Homepage
            </label>
            <button type="submit" disabled={adding} className="ml-auto bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap">
              {adding ? "Adding…" : "+ Add Category"}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-14 text-slate-500 text-sm">No categories{filterCountry ? ` for ${filterCountry.toUpperCase()}` : ""} yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 w-12">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Country</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Parent</th>
                <th className="text-left px-4 py-3">Homepage</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
