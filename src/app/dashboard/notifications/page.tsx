"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdNotifications, MdCheckCircle, MdInfo, MdWarning, MdCalendarToday, MdMessage, MdStar, MdDoneAll } from "react-icons/md";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  booking:  <MdCalendarToday className="text-orange-400" />,
  message:  <MdMessage className="text-blue-400" />,
  review:   <MdStar className="text-yellow-400" />,
  success:  <MdCheckCircle className="text-green-400" />,
  warning:  <MdWarning className="text-yellow-400" />,
  info:     <MdInfo className="text-blue-400" />,
  system:   <MdNotifications className="text-slate-400" />,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems]     = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | "unread">("all");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/notifications");
    const d = await r.json();
    setItems(d.notifications || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOne = async (id: number) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const displayed = filter === "unread" ? items.filter(n => !n.read) : items;
  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/8 rounded-xl text-sm text-slate-300 transition-colors"
          >
            <MdDoneAll /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-800/50 border border-white/8 rounded-xl p-1 w-fit">
        {(["all", "unread"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-orange-500 text-slate-900" : "text-slate-400 hover:text-white"}`}
          >
            {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
          <MdNotifications className="text-4xl text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No {filter === "unread" ? "unread " : ""}notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(n => (
            <div
              key={n.id}
              onClick={() => { if (!n.read) markOne(n.id); if (n.link) router.push(n.link); }}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                n.read
                  ? "bg-slate-800/30 border-white/5 hover:bg-slate-800/50"
                  : "bg-slate-800/60 border-white/10 hover:bg-slate-800/80"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900/60 border border-white/8 flex items-center justify-center text-lg shrink-0 mt-0.5">
                {TYPE_ICON[n.type] ?? TYPE_ICON.system}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.read ? "text-slate-300" : "text-white"}`}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500">{timeAgo(n.createdAt)}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
