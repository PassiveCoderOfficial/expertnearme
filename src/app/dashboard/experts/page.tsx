"use client";

import { useState, useEffect } from "react";

export default function ExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", isBusiness: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/experts")
      .then((res) => res.json())
      .then(setExperts)
      .catch(() => setExperts([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and Email are required.");
      return;
    }

    const res = await fetch("/api/dashboard/experts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create expert.");
      return;
    }

    setForm({ name: "", email: "", isBusiness: false });
    setSuccess("Expert added successfully.");
    const updated = await fetch("/api/dashboard/experts").then((res) => res.json());
    setExperts(updated);
  }

  async function handleDelete(id: number) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/dashboard/experts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete expert.");
      return;
    }
    setExperts((prev) => prev.filter((e) => e.id !== id));
    setSuccess("Expert deleted.");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Experts</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isBusiness}
            onChange={(e) => setForm({ ...form, isBusiness: e.target.checked })}
          />
          Business?
        </label>

        <div className="space-y-1">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
          <button type="submit" className="bg-[#b84c4c] text-white px-4 py-2 rounded">
            Add Expert
          </button>
        </div>
      </form>

      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Business?</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {experts.map((expert) => (
            <tr key={expert.id} className="hover:bg-gray-700">
              <td className="border px-4 py-2">{expert.name}</td>
              <td className="border px-4 py-2">{expert.email}</td>
              <td className="border px-4 py-2">{expert.isBusiness ? "Yes" : "No"}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDelete(expert.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {experts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-6 text-sm text-gray-400">
                No experts yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
