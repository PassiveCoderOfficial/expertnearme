"use client";

import { useState, useEffect } from "react";
import { MdRateReview, MdDelete, MdStar } from "react-icons/md";

interface Review {
  id: string;
  expertId: string;
  clientId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  expert: { name: string };
  client: { name: string };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/dashboard/reviews");
      const data = await res.json();
      if (data.ok) setReviews(data.reviews);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const stars = (n: number) => (
    <span className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <MdStar key={i} className={i < n ? "text-yellow-400" : "text-slate-700"} />
      ))}
    </span>
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
          <MdRateReview />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Reviews</h1>
          <p className="text-xs text-slate-400">{reviews.length} total</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-14 text-slate-500 text-sm">No reviews yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Expert</th>
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3">Rating</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Comment</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{r.expert?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{r.client?.name || "—"}</td>
                  <td className="px-5 py-3">{stars(r.rating)}</td>
                  <td className="px-5 py-3 text-slate-400 hidden md:table-cell max-w-xs truncate">{r.comment || "—"}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs hidden sm:table-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
                      <MdDelete /> Delete
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
