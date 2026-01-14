"use client";

import { useState, useEffect } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState({ bookingId: "", expertId: "", clientId: "", rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/reviews")
      .then((res) => res.json())
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.bookingId || !form.expertId || !form.clientId || !form.rating) {
      setError("Booking, Expert, Client and Rating are required.");
      return;
    }

    const payload = {
      bookingId: Number(form.bookingId),
      expertId: Number(form.expertId),
      clientId: Number(form.clientId),
      rating: Number(form.rating),
      comment: form.comment || null,
    };

    const res = await fetch("/api/dashboard/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create review.");
      return;
    }

    setForm({ bookingId: "", expertId: "", clientId: "", rating: 5, comment: "" });
    setSuccess("Review added successfully.");
    const updated = await fetch("/api/dashboard/reviews").then((res) => res.json());
    setReviews(updated);
  }

  async function handleDelete(id: number) {
    setError("");
    setSuccess("");
    const res = await fetch(`/api/dashboard/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete review.");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setSuccess("Review deleted.");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Booking ID"
          value={form.bookingId}
          onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Expert ID"
          value={form.expertId}
          onChange={(e) => setForm({ ...form, expertId: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Client ID"
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />
        <label className="flex items-center gap-2">
          Rating:
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="ml-2 bg-gray-800 text-white px-2 py-1 rounded"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <textarea
          placeholder="Comment (optional)"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
        />

        <div className="space-y-1">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
          <button type="submit" className="bg-[#b84c4c] text-white px-4 py-2 rounded">
            Add Review
          </button>
        </div>
      </form>

      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border px-4 py-2">Booking ID</th>
            <th className="border px-4 py-2">Expert ID</th>
            <th className="border px-4 py-2">Client ID</th>
            <th className="border px-4 py-2">Rating</th>
            <th className="border px-4 py-2">Comment</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="hover:bg-gray-700">
              <td className="border px-4 py-2">{r.bookingId}</td>
              <td className="border px-4 py-2">{r.expertId}</td>
              <td className="border px-4 py-2">{r.clientId}</td>
              <td className="border px-4 py-2">{r.rating}</td>
              <td className="border px-4 py-2">{r.comment || "—"}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-sm text-gray-400">
                No reviews yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
