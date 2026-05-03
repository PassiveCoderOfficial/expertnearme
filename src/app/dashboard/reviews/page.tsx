import { prisma } from "@/lib/db";

import { useEffect, useState } from "react";
import { MdStar, MdDelete, MdEdit, MdClose, MdCheck, MdRateReview, MdRefresh } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

/* ─── types ────────────────────────────────────────────────────── */
type ReviewForAdmin = {
  id: number; rating: number; comment: string | null; createdAt: string;
  expert: { id: number; name: string; businessName: string | null; profileLink: string | null };
  client: { id: number; name: string; email: string };
  booking: { id: number; scheduledAt: string; service: { name: string } | null } | null;
};
type ReviewForExpert = {
  id: number; rating: number; comment: string | null; createdAt: string;
  client: { id: number; name: string; profile: { avatar: string | null } | null };
  booking: { id: number; scheduledAt: string; service: { name: string } | null } | null;
};
type ReviewForBuyer = {
  id: number; rating: number; comment: string | null; createdAt: string;
  expert: { id: number; name: string; businessName: string | null; profileLink: string | null; profilePicture: string | null };
  booking: { id: number; scheduledAt: string; service: { name: string } | null } | null;
};
type ReviewableBooking = {
  id: number; scheduledAt: string;
  expert: { id: number; name: string; businessName: string | null; profileLink: string | null; profilePicture: string | null };
  service: { name: string } | null;
};

/* ─── helpers ───────────────────────────────────────────────────── */
function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = interactive ? (hovered || rating) > i : rating > i;
        return (
          <MdStar
            key={i}
            className={`${interactive ? "cursor-pointer text-lg" : "text-sm"} transition-colors ${filled ? "text-yellow-400" : "text-slate-600"}`}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </span>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) return <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

/* ─── Review form modal ─────────────────────────────────────────── */
function ReviewModal({
  booking,
  existing,
  onClose,
  onSaved,
}: {
  booking?: ReviewableBooking;
  existing?: ReviewForBuyer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating]   = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const isEdit = !!existing;

  const save = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setSaving(true);
    setError("");
    const res = isEdit
      ? await fetch(`/api/reviews/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment }),
        })
      : await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking!.id, rating, comment }),
        });
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error || "Failed"); }
    setSaving(false);
  };

  const expertName = booking ? (booking.expert.businessName || booking.expert.name) : (existing?.expert.businessName || existing?.expert.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="font-bold text-white">{isEdit ? "Edit Review" : "Write a Review"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><MdClose /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-white/8 rounded-xl">
            <Avatar name={expertName || "?"} src={booking?.expert.profilePicture ?? existing?.expert.profilePicture} />
            <div>
              <p className="text-sm font-semibold text-white">{expertName}</p>
              {(booking?.service || existing?.booking?.service) && (
                <p className="text-xs text-orange-300">{booking?.service?.name ?? existing?.booking?.service?.name}</p>
              )}
              {(booking?.scheduledAt || existing?.booking?.scheduledAt) && (
                <p className="text-xs text-slate-500">{new Date(booking?.scheduledAt ?? existing?.booking?.scheduledAt ?? "").toLocaleDateString()}</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">Your rating</p>
            <Stars rating={rating} interactive onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Review (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience…"
              className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={save}
            disabled={saving || !rating}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-900 font-bold rounded-xl text-sm transition-colors"
          >
            {saving ? "Saving…" : isEdit ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin view ────────────────────────────────────────────────── */
function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/dashboard/reviews");
    const d = await r.json();
    setReviews(d.reviews || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/dashboard/reviews/${id}`, { method: "DELETE" });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = search
    ? reviews.filter(r =>
        r.client.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.expert.businessName || r.expert.name).toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", val: reviews.length, color: "text-white" },
          { label: "Avg Rating",    val: avgRating ? `★ ${avgRating}` : "—", color: "text-yellow-400" },
          { label: "5 Stars",       val: reviews.filter(r => r.rating === 5).length, color: "text-green-400" },
          { label: "1-2 Stars",     val: reviews.filter(r => r.rating <= 2).length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by expert, client or comment…"
        className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40"
      />

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center text-slate-500 text-sm">No reviews found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-slate-800/50 border border-white/8 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
                    {r.client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-white">{r.client.name}</p>
                      <span className="text-slate-500 text-xs">→</span>
                      <p className="text-sm text-orange-300">{r.expert.businessName || r.expert.name}</p>
                      <Stars rating={r.rating} />
                      <span className="text-xs text-slate-600">{timeAgo(r.createdAt)}</span>
                    </div>
                    {r.booking?.service && <p className="text-xs text-slate-500 mb-1">{r.booking.service.name}</p>}
                    {r.comment && <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
                <button onClick={() => del(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/15 border border-red-500/20 rounded-lg transition-colors shrink-0">
                  <MdDelete /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Expert view ───────────────────────────────────────────────── */
function ExpertReviews() {
  const [reviews, setReviews] = useState<ReviewForExpert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/my/reviews");
    const d = await r.json();
    setReviews(d.reviews || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) dist[r.rating] = (dist[r.rating] || 0) + 1;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  return (
    <div className="space-y-6">
      {reviews.length > 0 && (
        <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-orange-400">{avg!.toFixed(1)}</p>
            <Stars rating={Math.round(avg!)} />
            <p className="text-xs text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-3">{star}</span>
                <MdStar className="text-yellow-400 text-xs" />
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${reviews.length ? (dist[star] / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-4">{dist[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
          <MdRateReview className="text-4xl text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No reviews yet. Complete bookings to receive reviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-slate-800/50 border border-white/8 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Avatar name={r.client.name} src={r.client.profile?.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-white">{r.client.name}</p>
                    <Stars rating={r.rating} />
                    <span className="text-xs text-slate-600">{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.booking?.service && <p className="text-xs text-orange-300 mb-1">{r.booking.service.name}</p>}
                  {r.comment && <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Buyer view ────────────────────────────────────────────────── */
function BuyerReviews() {
  const [reviews, setReviews]           = useState<ReviewForBuyer[]>([]);
  const [reviewable, setReviewable]     = useState<ReviewableBooking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState<{ booking?: ReviewableBooking; existing?: ReviewForBuyer } | null>(null);

  const load = async () => {
    setLoading(true);
    const [rr, rb] = await Promise.all([
      fetch("/api/my/reviews").then(r => r.json()),
      fetch("/api/my/reviewable-bookings").then(r => r.json()),
    ]);
    setReviews(rr.reviews || []);
    setReviewable(rb.bookings || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {modal && (
        <ReviewModal
          booking={modal.booking}
          existing={modal.existing}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {/* Pending reviews — bookings awaiting a review */}
      {reviewable.length > 0 && (
        <div className="bg-orange-500/8 border border-orange-500/20 rounded-2xl p-5">
          <p className="text-sm font-bold text-orange-300 mb-3">
            {reviewable.length} booking{reviewable.length !== 1 ? "s" : ""} awaiting your review
          </p>
          <div className="space-y-2">
            {reviewable.map(b => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 bg-slate-900/50 border border-white/8 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={b.expert.businessName || b.expert.name} src={b.expert.profilePicture} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{b.expert.businessName || b.expert.name}</p>
                    <p className="text-xs text-slate-500">{b.service?.name} · {new Date(b.scheduledAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModal({ booking: b })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-900 text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  <MdStar /> Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Written reviews */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 mb-3">Your Reviews ({reviews.length})</h3>
        {loading ? (
          <div className="flex justify-center h-32 items-center">
            <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
            <MdRateReview className="text-4xl text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No reviews written yet. Complete a booking to leave a review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => {
              const expertName = r.expert.businessName || r.expert.name;
              const editable = Date.now() - new Date(r.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
              return (
                <div key={r.id} className="bg-slate-800/50 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={expertName} src={r.expert.profilePicture} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-semibold text-white">{expertName}</p>
                            <Stars rating={r.rating} />
                            <span className="text-xs text-slate-600">{timeAgo(r.createdAt)}</span>
                          </div>
                          {r.booking?.service && <p className="text-xs text-orange-300 mb-1">{r.booking.service.name}</p>}
                          {r.comment && <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>}
                          {!r.comment && <p className="text-xs text-slate-600 italic">No comment written.</p>}
                        </div>
                        {editable && (
                          <button onClick={() => setModal({ existing: r })} className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-400 transition-colors shrink-0">
                            <MdEdit /> Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (e) {
    console.error("ReviewsPage error:", e);
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>
        <p className="text-red-500">Failed to load reviews: {String(e)}</p>
      </div>
    );
  }
}

/* ─── Main page ─────────────────────────────────────────────────── */
const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);

export default function ReviewsPage() {
  const { session } = useAuth();

  if (!session) return null;

  const role = session.role ?? "";
  const isAdmin  = ADMIN_ROLES.has(role);
  const isExpert = role === "EXPERT";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isAdmin ? "Manage all reviews" : isExpert ? "Reviews received from clients" : "Your reviews & pending feedback"}
          </p>
        </div>
      </div>

      {isAdmin  && <AdminReviews />}
      {isExpert && <ExpertReviews />}
      {!isAdmin && !isExpert && <BuyerReviews />}
    </div>
  );
}
