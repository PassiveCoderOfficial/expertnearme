"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronUp, LifeBuoy } from "lucide-react";

type Ticket = {
  id: number;
  name: string;
  email: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  adminNote: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300",
  IN_PROGRESS: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  RESOLVED: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300",
  CLOSED: "bg-slate-100 dark:bg-slate-700 text-slate-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-400",
  NORMAL: "text-slate-600 dark:text-slate-300",
  HIGH: "text-orange-500",
  URGENT: "text-red-500 font-bold",
};

const TYPE_LABELS: Record<string, string> = {
  BUG: "🐛 Bug",
  FEATURE: "✨ Feature",
  BILLING: "💳 Billing",
  OTHER: "💬 Other",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => { load(); }, [filterStatus, filterType]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("type", filterType);
    const res = await fetch(`/api/dashboard/support?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets);
    }
    setLoading(false);
  }

  async function update(id: number, patch: Partial<Pick<Ticket, "status" | "priority" | "adminNote">>) {
    setSaving(id);
    const res = await fetch("/api/dashboard/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    setSaving(null);
    if (res.ok) {
      const data = await res.json();
      setTickets((prev) => prev.map((t) => t.id === id ? data.ticket : t));
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">

        <div className="flex items-center gap-3 mb-8">
          <LifeBuoy className="w-6 h-6 text-orange-500" />
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold">Admin</p>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="BILLING">Billing</option>
            <option value="OTHER">Other</option>
          </select>
          <div className="ml-auto text-sm text-slate-400 self-center">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-20 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-20 text-center text-slate-400 dark:text-slate-500">
            No tickets found.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none">
                <button
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                  onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                >
                  <span className={`text-xs font-medium shrink-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0 w-16">{TYPE_LABELS[ticket.type] || ticket.type}</span>
                  <span className="flex-1 font-semibold text-sm text-slate-800 dark:text-white truncate">{ticket.subject}</span>
                  <span className="text-xs text-slate-400 shrink-0">{ticket.name}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[ticket.status] || ""}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {expanded === ticket.id ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {expanded === ticket.id && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/6 pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">From</p>
                        <p className="text-slate-700 dark:text-slate-200">{ticket.name} — <a href={`mailto:${ticket.email}`} className="text-orange-500 hover:underline">{ticket.email}</a></p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Submitted</p>
                        <p className="text-slate-700 dark:text-slate-200">{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1.5">Description</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                        <select
                          value={ticket.status}
                          onChange={(e) => update(ticket.id, { status: e.target.value })}
                          disabled={saving === ticket.id}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Priority</label>
                        <select
                          value={ticket.priority}
                          onChange={(e) => update(ticket.id, { priority: e.target.value })}
                          disabled={saving === ticket.id}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          <option value="LOW">Low</option>
                          <option value="NORMAL">Normal</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs text-slate-400 mb-1.5">Admin Note</label>
                        <div className="flex gap-2">
                          <input
                            value={notes[ticket.id] ?? ticket.adminNote ?? ""}
                            onChange={(e) => setNotes((n) => ({ ...n, [ticket.id]: e.target.value }))}
                            placeholder="Internal note..."
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 transition-colors"
                          />
                          <button
                            onClick={() => update(ticket.id, { adminNote: notes[ticket.id] ?? ticket.adminNote ?? "" })}
                            disabled={saving === ticket.id}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
                          >
                            {saving === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
