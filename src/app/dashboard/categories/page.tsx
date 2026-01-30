// File: src/app/dashboard/categories/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

type Cat = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: Cat[];
  showOnHomepage?: boolean;
};

export default function DashboardCategoriesPage() {
  const { session } = useAuth();
  const { toast } = useToast();

  const [tree, setTree] = useState<Cat[]>([]);
  const [flat, setFlat] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
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

  useEffect(() => {
    if (session?.role === "ADMIN") {
      fetchCategories();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.role]);

  // Add category
  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    setAdding(true);
    try {
      const payload = {
        name: newName.trim(),
        slug: newSlug.trim() || toSlug(newName),
        parentId: newParentId === "" ? null : Number(newParentId),
        showOnHomepage: Boolean(newShowOnHomepage),
      };
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add category");
      setSuccess(`Category "${data.category.name}" added`);
      setNewName("");
      setNewSlug("");
      setNewParentId("");
      setNewShowOnHomepage(false);
      await fetchCategories();
      toast("Category added", { type: "success" });
    } catch (err: any) {
      console.error("Add category error:", err);
      setError(err?.message || "Network error");
      toast("Failed to add category", { type: "error" });
    } finally {
      setAdding(false);
    }
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

  // Build table rows (flattened tree traversal)
  const rows = useMemo(() => {
    const r: React.ReactNode[] = [];
    const walk = (nodes: Cat[], depth = 0) => {
      nodes.forEach((cat) => {
        r.push(
          <tr key={cat.id}>
            <td className="border p-2 text-sm">{cat.id}</td>

            <td className="border p-2 text-sm">
              {editingId === cat.id ? (
                <input
                  value={editName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditName(val);
                    setEditSlug(toSlug(val));
                  }}
                  className="border p-1 w-full"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {"\u00A0".repeat(depth * 2)}
                    {depth > 0 && <span className="text-gray-400">&lt;</span>}
                    {cat.name}
                  </span>
                </div>
              )}
            </td>

            <td className="border p-2 text-sm">
              {editingId === cat.id ? (
                <input
                  value={editSlug}
                  onChange={(e) => setEditSlug(toSlug(e.target.value))}
                  className="border p-1 w-full"
                />
              ) : (
                <span className="text-sm">{cat.slug}</span>
              )}
            </td>

            <td className="border p-2 text-sm">
              {editingId === cat.id ? (
                <select
                  value={editParentId ?? ""}
                  onChange={(e) =>
                    setEditParentId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="border p-1 w-full"
                >
                  <option value="">No parent (top-level)</option>
                  {flat
                    .filter((p) => p.id !== cat.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              ) : (
                <span className="text-sm">
                  {cat.parentId ? flat.find((p) => p.id === cat.parentId)?.name?.replace(/^-+\s*/, "") : "-"}
                </span>
              )}
            </td>

            <td className="border p-2 text-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleShowOnHomepage(cat)}
                  className={`px-2 py-1 rounded text-sm ${
                    cat.showOnHomepage ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                  title={cat.showOnHomepage ? "Shown on homepage" : "Hidden from homepage"}
                >
                  {cat.showOnHomepage ? "Yes" : "No"}
                </button>

                {editingId === cat.id ? (
                  <>
                    <button onClick={handleUpdate} className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                        setEditSlug("");
                        setEditParentId("");
                        setEditShowOnHomepage(false);
                      }}
                      className="bg-gray-400 text-white px-2 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        );
        if (cat.children && cat.children.length) walk(cat.children, depth + 1);
      });
    };

    walk(tree);
    return r;
  }, [tree, flat, editingId, editName, editSlug, editParentId, editShowOnHomepage]);

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
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Category Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              const val = e.target.value;
              setNewName(val);
              setNewSlug(toSlug(val));
            }}
            placeholder="e.g. Health, Legal, IT"
            className="border p-2 w-full"
            required
          />
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

        <div>
          <label className="block text-sm font-medium mb-1">Parent Category</label>
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value === "" ? "" : Number(e.target.value))}
            className="border p-2 w-full"
          >
            <option value="">No parent (top-level)</option>
            {flat.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Show on Homepage</label>
          <input
            type="checkbox"
            checked={newShowOnHomepage}
            onChange={(e) => setNewShowOnHomepage(e.target.checked)}
            className="h-5 w-5 text-[#b84c4c] border-gray-300 rounded"
          />
        </div>

        <div>
          <button type="submit" disabled={adding} className="bg-[#b84c4c] text-white px-4 py-2 rounded disabled:opacity-50">
            {adding ? "Adding..." : "Add Category"}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-700 mt-2">{success}</p>}
        </div>
      </form>

      {/* Category Tree Table */}
      {loading ? (
        <div className="text-gray-500 italic">Loading categories...</div>
      ) : tree.length === 0 ? (
        <div className="border border-gray-300 rounded p-4 text-center text-gray-600">
          <p className="mb-2">No categories found.</p>
          <p>Use the form above to add your first parent category.</p>
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Slug</th>
              <th className="border p-2 text-left">Parent</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      )}
    </main>
  );
}
