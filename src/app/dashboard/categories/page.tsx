"use client";

import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", showOnHomepage: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and Slug are required.");
      return;
    }

    const res = await fetch("/api/dashboard/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create category.");
      return;
    }

    setForm({ name: "", slug: "", showOnHomepage: false });
    setSuccess("Category added successfully.");
    const updated = await fetch("/api/dashboard/categories").then((res) => res.json());
    setCategories(updated);
  }

  async function handleDelete(id: number) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/dashboard/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete category.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSuccess("Category deleted.");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.showOnHomepage}
            onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
          />
          Show on Homepage?
        </label>

        <div className="space-y-1">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
          <button type="submit" className="bg-[#b84c4c] text-white px-4 py-2 rounded">
            Add Category
          </button>
        </div>
      </form>

      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Slug</th>
            <th className="border px-4 py-2">Homepage?</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-700">
              <td className="border px-4 py-2">{cat.name}</td>
              <td className="border px-4 py-2">{cat.slug}</td>
              <td className="border px-4 py-2">{cat.showOnHomepage ? "Yes" : "No"}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-6 text-sm text-gray-400">
                No categories yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
