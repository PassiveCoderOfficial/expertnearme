"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MdCampaign, MdEdit, MdCheck, MdClose, MdRefresh,
  MdToggleOn, MdToggleOff, MdFilterList, MdCreditCard,
} from "react-icons/md";

type AdSpot =
  | "BANNER_TOP"
  | "SEARCH_SPONSOR"
  | "HOME_FEATURED"
  | "COUNTRY_FEATURED"
  | "CATEGORY_FEATURED"
  | "PROFILE_SIDEBAR"
  | "MAP_FEATURED";

type AdCampaignStatus = "PENDING" | "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";

interface Placement {
  id: number;
  spot: AdSpot;
  label: string;
  description: string | null;
  weeklyPrice: number;
  monthlyPrice: number;
  maxSlots: number;
  active: boolean;
  requiresApproval: boolean;
  _count: { campaigns: number };
}

interface Campaign {
  id: number;
  expertId: number;
  billingCycle: "WEEKLY" | "MONTHLY";
  status: AdCampaignStatus;
  startsAt: string;
  endsAt: string;
  amountPaid: number;
  currency: string;
  impressions: number;
  clicks: number;
  adminNote: string | null;
  targetCountry: string | null;
  targetCategory: string | null;
  expert: { id: number; name: string; profileLink: string | null; profilePicture: string | null };
  placement: { id: number; spot: AdSpot; label: string };
}

const inputCls =
  "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

const STATUS_COLORS: Record<AdCampaignStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  ACTIVE: "bg-green-500/20 text-green-300 border-green-500/30",
  PAUSED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  EXPIRED: "bg-slate-700 text-slate-400 border-slate-600",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
};

const CREDIT_PACKAGES = [
  { credits: 100, price: 10 },
  { credits: 500, price: 45 },
  { credits: 1000, price: 80 },
  { credits: 5000, price: 350 },
];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: AdCampaignStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

export default function AdsPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"placements" | "campaigns" | "credits">("placements");
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [editForm, setEditForm] = useState({ weeklyPrice: "", monthlyPrice: "", maxSlots: "", description: "" });
  const [savingPlacement, setSavingPlacement] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null);

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok });
    setTimeout(() => setFlash(null), 3000);
  };

  const loadPlacements = useCallback(async () => {
    setLoadingPlacements(true);
    try {
      const res = await fetch("/api/admin/ad-placements");
      const data = await res.json();
      if (data.placements) setPlacements(data.placements);
    } catch {
      showFlash("Failed to load placements", false);
    } finally {
      setLoadingPlacements(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/ad-campaigns${qs}`);
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch {
      showFlash("Failed to load campaigns", false);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!authLoading && session) {
      if (!["SUPER_ADMIN", "ADMIN"].includes(session.role || "")) {
        router.push("/dashboard");
      }
    }
  }, [session, authLoading, router]);

  useEffect(() => { loadPlacements(); }, [loadPlacements]);
  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  function openEdit(p: Placement) {
    setEditingPlacement(p);
    setEditForm({
      weeklyPrice: String(p.weeklyPrice),
      monthlyPrice: String(p.monthlyPrice),
      maxSlots: String(p.maxSlots),
      description: p.description || "",
    });
  }

  async function savePlacement() {
    if (!editingPlacement) return;
    setSavingPlacement(true);
    try {
      const res = await fetch("/api/admin/ad-placements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spot: editingPlacement.spot,
          weeklyPrice: Number(editForm.weeklyPrice),
          monthlyPrice: Number(editForm.monthlyPrice),
          maxSlots: Number(editForm.maxSlots),
          description: editForm.description || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFlash("Placement updated");
        setEditingPlacement(null);
        loadPlacements();
      } else {
        showFlash(data.error || "Failed to update", false);
      }
    } catch {
      showFlash("Failed to update placement", false);
    } finally {
      setSavingPlacement(false);
    }
  }

  async function togglePlacementActive(p: Placement) {
    try {
      const res = await fetch("/api/admin/ad-placements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spot: p.spot, active: !p.active }),
      });
      if (res.ok) {
        showFlash(`Placement ${p.active ? "deactivated" : "activated"}`);
        loadPlacements();
      }
    } catch {
      showFlash("Failed to toggle placement", false);
    }
  }

  async function campaignAction(id: number, action: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ad-campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showFlash(`Campaign ${action}d`);
        loadCampaigns();
      } else {
        showFlash(data.error || "Failed", false);
      }
    } catch {
      showFlash("Action failed", false);
    } finally {
      setActionLoading(null);
    }
  }

  async function setCampaignStatus(id: number, status: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ad-campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showFlash("Status updated");
        loadCampaigns();
      } else {
        showFlash("Failed to update status", false);
      }
    } catch {
      showFlash("Action failed", false);
    } finally {
      setActionLoading(null);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {flash && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium border shadow-xl transition-all ${
          flash.ok
            ? "bg-green-500/20 text-green-300 border-green-500/30"
            : "bg-red-500/20 text-red-300 border-red-500/30"
        }`}>
          {flash.text}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/20">
          <MdCampaign className="text-orange-400 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Ads & Featured Placements</h1>
          <p className="text-sm text-slate-400">Manage ad spots, campaigns, and credit packages</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-800/50 border border-white/8 rounded-2xl p-1">
        {(["placements", "campaigns", "credits"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t === "placements" ? "Placements Config" : t === "campaigns" ? "Active Campaigns" : "Credit Packages"}
          </button>
        ))}
      </div>

      {tab === "placements" && (
        <div className="bg-slate-800/50 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-semibold text-white">Ad Spot Configuration</h2>
            <button
              onClick={loadPlacements}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MdRefresh className="text-lg" />
            </button>
          </div>

          {loadingPlacements ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Spot", "Label", "Weekly", "Monthly", "Max Slots", "Active Slots", "Active", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {placements.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-orange-400">{p.spot}</td>
                      <td className="px-4 py-3 text-white">{p.label}</td>
                      <td className="px-4 py-3 text-slate-300">${p.weeklyPrice}</td>
                      <td className="px-4 py-3 text-slate-300">${p.monthlyPrice}</td>
                      <td className="px-4 py-3 text-slate-300">{p.maxSlots}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${p._count.campaigns >= p.maxSlots ? "text-red-400" : "text-green-400"}`}>
                          {p._count.campaigns} / {p.maxSlots}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePlacementActive(p)}
                          className={`text-2xl transition-colors ${p.active ? "text-green-400 hover:text-green-300" : "text-slate-600 hover:text-slate-400"}`}
                        >
                          {p.active ? <MdToggleOn /> : <MdToggleOff />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                        >
                          <MdEdit className="text-sm" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {editingPlacement && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingPlacement(null)} />
              <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-white">Edit Placement</h3>
                    <p className="text-xs text-orange-400 font-mono mt-0.5">{editingPlacement.spot}</p>
                  </div>
                  <button onClick={() => setEditingPlacement(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                    <MdClose />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Optional description"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Weekly Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.weeklyPrice}
                        onChange={(e) => setEditForm((f) => ({ ...f, weeklyPrice: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.monthlyPrice}
                        onChange={(e) => setEditForm((f) => ({ ...f, monthlyPrice: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Slots</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.maxSlots}
                      onChange={(e) => setEditForm((f) => ({ ...f, maxSlots: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingPlacement(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/8 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePlacement}
                    disabled={savingPlacement}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors disabled:opacity-50"
                  >
                    {savingPlacement ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <MdCheck />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "campaigns" && (
        <div className="bg-slate-800/50 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
            <h2 className="font-semibold text-white flex-1">Campaigns</h2>
            <div className="flex items-center gap-2">
              <MdFilterList className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-orange-500/50"
              >
                <option value="">All Statuses</option>
                {["PENDING", "ACTIVE", "PAUSED", "EXPIRED", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={loadCampaigns}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MdRefresh className="text-lg" />
            </button>
          </div>

          {loadingCampaigns ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <MdCampaign className="text-4xl mb-2" />
              <p className="text-sm">No campaigns found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Expert", "Spot", "Cycle", "Status", "Dates", "Paid", "Impressions", "Clicks", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{c.expert.name}</div>
                        <div className="text-xs text-slate-500">ID {c.expertId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-300">{c.placement.label}</div>
                        <div className="text-xs font-mono text-orange-400/70">{c.placement.spot}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{c.billingCycle}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-slate-300 text-xs">{formatDate(c.startsAt)}</div>
                        <div className="text-slate-500 text-xs">→ {formatDate(c.endsAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-medium">${c.amountPaid}</td>
                      <td className="px-4 py-3 text-slate-400">{c.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-400">{c.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {c.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => campaignAction(c.id, "approve")}
                                disabled={actionLoading === c.id}
                                className="px-2.5 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium border border-green-500/30 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => campaignAction(c.id, "reject")}
                                disabled={actionLoading === c.id}
                                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {c.status === "ACTIVE" && (
                            <button
                              onClick={() => setCampaignStatus(c.id, "PAUSED")}
                              disabled={actionLoading === c.id}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium border border-blue-500/30 transition-colors disabled:opacity-50"
                            >
                              Pause
                            </button>
                          )}
                          {c.status === "PAUSED" && (
                            <button
                              onClick={() => setCampaignStatus(c.id, "ACTIVE")}
                              disabled={actionLoading === c.id}
                              className="px-2.5 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium border border-green-500/30 transition-colors disabled:opacity-50"
                            >
                              Resume
                            </button>
                          )}
                          {!["CANCELLED", "EXPIRED"].includes(c.status) && (
                            <button
                              onClick={() => setCampaignStatus(c.id, "CANCELLED")}
                              disabled={actionLoading === c.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-red-300 text-xs font-medium border border-white/8 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "credits" && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
              <MdCreditCard className="text-orange-400 text-xl" />
              <h2 className="font-semibold text-white">Credit Packages</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Credits", "Price (USD)", "Per Credit", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <tr key={pkg.credits} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white text-base">{pkg.credits.toLocaleString()}</span>
                        <span className="text-slate-500 ml-1.5 text-xs">credits</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-orange-400 font-bold text-base">${pkg.price}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        ${(pkg.price / pkg.credits).toFixed(3)} / credit
                      </td>
                      <td className="px-6 py-4">
                        <button
                          disabled
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-500 text-xs font-medium border border-white/5 cursor-not-allowed"
                        >
                          <MdEdit className="text-sm" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-white/5 rounded-2xl px-6 py-4 flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-400">
              Credit purchase flow coming soon. Packages and pricing shown above are for planning only and will be activated in a future release.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
