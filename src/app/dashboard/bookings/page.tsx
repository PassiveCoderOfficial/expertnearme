"use client";

import { useEffect, useState } from "react";
import { MdCalendarToday, MdRefresh, MdCheck, MdClose, MdSchedule, MdMessage } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type BookingService = { id: number; name: string; duration: number; rateUnit: string | null } | null;
type Booking = {
  id: number;
  status: string;
  scheduledAt: string;
  endsAt: string | null;
  notes: string | null;
  isUrgent: boolean;
  service: BookingService;
  expert: { id: number; name: string; businessName: string | null; profileLink: string | null; profilePicture: string | null; userId: number | null };
  client: { id: number; name: string; email: string };
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:     "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  APPROVED:    "bg-green-500/15 text-green-400 border-green-500/20",
  DECLINED:    "bg-red-500/15 text-red-400 border-red-500/20",
  RESCHEDULED: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  DONE:        "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

export default function BookingsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"incoming" | "mine">("incoming");
  const [acting, setActing]     = useState<number | null>(null);
  const [messaging, setMessaging] = useState<number | null>(null);

  const isExpert = session?.role === "EXPERT";

  const load = async () => {
    setLoading(true);
    const role = isExpert ? "expert" : "buyer";
    const r = await fetch(`/api/bookings?role=${role}`);
    const d = await r.json();
    setBookings(d.bookings || []);
    setLoading(false);
  };

  useEffect(() => { if (session) load(); }, [session]);

  const messageUser = async (toUserId: number, bookingId: number) => {
    setMessaging(bookingId);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, content: "Hi, I'd like to discuss our booking." }),
    });
    router.push("/dashboard/messages");
  };

  const act = async (id: number, status: string) => {
    setActing(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setActing(null);
  };

  const upcoming  = bookings.filter(b => new Date(b.scheduledAt) >= new Date() && b.status !== "DECLINED" && b.status !== "DONE");
  const past      = bookings.filter(b => new Date(b.scheduledAt) < new Date() || b.status === "DONE" || b.status === "DECLINED");
  const displayed = tab === "incoming" ? upcoming : past;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isExpert ? "Manage your incoming booking requests" : "Your scheduled sessions"}
          </p>
        </div>
        <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/8 rounded-lg text-slate-400 transition-colors">
          <MdRefresh />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending",   val: bookings.filter(b => b.status === "PENDING").length,   color: "text-yellow-400" },
          { label: "Approved",  val: bookings.filter(b => b.status === "APPROVED").length,  color: "text-green-400" },
          { label: "Completed", val: bookings.filter(b => b.status === "DONE").length,      color: "text-slate-400" },
          { label: "Declined",  val: bookings.filter(b => b.status === "DECLINED").length,  color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 border border-white/8 rounded-xl p-1 w-fit">
        {([["incoming", "Upcoming"], ["mine", "Past"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-orange-500 text-slate-900" : "text-slate-400 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
          <MdCalendarToday className="text-4xl text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No {tab === "incoming" ? "upcoming" : "past"} bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(b => {
            const date = new Date(b.scheduledAt);
            const expertName = b.expert.businessName || b.expert.name;
            return (
              <div key={b.id} className="bg-slate-800/50 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    {/* Date block */}
                    <div className="bg-slate-900/60 border border-white/8 rounded-xl px-4 py-2 text-center shrink-0 min-w-[56px]">
                      <p className="text-orange-400 text-xs font-bold uppercase">
                        {date.toLocaleDateString("en", { month: "short" })}
                      </p>
                      <p className="text-white text-2xl font-bold leading-none">{date.getDate()}</p>
                      <p className="text-slate-500 text-[10px]">{date.getFullYear()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white font-semibold">
                          {isExpert ? b.client.name : expertName}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[b.status] || STATUS_COLOR.PENDING}`}>
                          {b.status}
                        </span>
                        {b.isUrgent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                            ⚡ Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <MdSchedule className="text-sm" />
                        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {b.endsAt && ` – ${new Date(b.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </div>
                      {b.service && (
                        <p className="text-xs text-orange-300 mt-1">{b.service.name} · {b.service.duration} min</p>
                      )}
                      {b.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">"{b.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Actions — expert only for pending */}
                  {isExpert && b.status === "PENDING" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => act(b.id, "APPROVED")}
                        disabled={acting === b.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 text-green-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MdCheck /> Approve
                      </button>
                      <button
                        onClick={() => act(b.id, "DECLINED")}
                        disabled={acting === b.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MdClose /> Decline
                      </button>
                    </div>
                  )}
                  {isExpert && b.status === "APPROVED" && (
                    <button
                      onClick={() => act(b.id, "DONE")}
                      disabled={acting === b.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-white/10 text-slate-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      Mark Done
                    </button>
                  )}
                  {!isExpert && b.status === "PENDING" && (
                    <button
                      onClick={() => act(b.id, "DECLINED")}
                      disabled={acting === b.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      <MdClose /> Cancel
                    </button>
                  )}
                  {/* Message the other party */}
                  {isExpert && b.client.id && (
                    <button
                      onClick={() => messageUser(b.client.id, b.id)}
                      disabled={messaging === b.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/25 text-blue-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      <MdMessage /> Message
                    </button>
                  )}
                  {!isExpert && b.expert.userId && (
                    <button
                      onClick={() => messageUser(b.expert.userId!, b.id)}
                      disabled={messaging === b.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/25 text-blue-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      <MdMessage /> Message
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
