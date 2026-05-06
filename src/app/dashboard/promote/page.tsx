"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MdCampaign, MdClose, MdCheck, MdInfoOutline,
  MdRocketLaunch, MdVisibility, MdSearch, MdHome,
  MdMap, MdPerson, MdCategory, MdStar,
} from "react-icons/md";

type AdSpot =
  | "BANNER_TOP" | "SEARCH_SPONSOR" | "HOME_FEATURED"
  | "COUNTRY_FEATURED" | "CATEGORY_FEATURED" | "PROFILE_SIDEBAR" | "MAP_FEATURED";

type CampaignStatus = "PENDING" | "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";

interface Placement {
  id: number;
  spot: AdSpot;
  label: string;
  description: string | null;
  weeklyPrice: number;
  monthlyPrice: number;
  maxSlots: number;
  requiresApproval: boolean;
  _count: { campaigns: number };
}

interface Campaign {
  id: number;
  billingCycle: "WEEKLY" | "MONTHLY";
  status: CampaignStatus;
  startsAt: string;
  endsAt: string;
  amountPaid: number;
  impressions: number;
  clicks: number;
  placement: { spot: AdSpot; label: string };
}

const SPOT_ICONS: Record<AdSpot, React.ReactNode> = {
  BANNER_TOP:       <MdRocketLaunch className="text-2xl" />,
  SEARCH_SPONSOR:   <MdSearch className="text-2xl" />,
  HOME_FEATURED:    <MdHome className="text-2xl" />,
  COUNTRY_FEATURED: <MdVisibility className="text-2xl" />,
  CATEGORY_FEATURED:<MdCategory className="text-2xl" />,
  PROFILE_SIDEBAR:  <MdPerson className="text-2xl" />,
  MAP_FEATURED:     <MdMap className="text-2xl" />,
};

const SPOT_COLORS: Record<AdSpot, string> = {
  BANNER_TOP:       "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  SEARCH_SPONSOR:   "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  HOME_FEATURED:    "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  COUNTRY_FEATURED: "from-green-500/20 to-teal-500/20 border-green-500/30",
  CATEGORY_FEATURED:"from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  PROFILE_SIDEBAR:  "from-slate-500/20 to-slate-600/20 border-slate-500/30",
  MAP_FEATURED:     "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
};

const SPOT_ICON_COLORS: Record<AdSpot, string> = {
  BANNER_TOP:       "text-purple-400",
  SEARCH_SPONSOR:   "text-blue-400",
  HOME_FEATURED:    "text-orange-400",
  COUNTRY_FEATURED: "text-green-400",
  CATEGORY_FEATURED:"text-yellow-400",
  PROFILE_SIDEBAR:  "text-slate-400",
  MAP_FEATURED:     "text-teal-400",
};

const STATUS_COLORS: Record<CampaignStatus, string> = {
  PENDING:   "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  ACTIVE:    "bg-green-500/20 text-green-300 border-green-500/30",
  PAUSED:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  EXPIRED:   "bg-slate-700 text-slate-400 border-slate-600",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
};

const inputCls = "w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PromotePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [tab, setTab] = useState<"browse" | "my-campaigns">("browse");

  const [buyModal, setBuyModal] = useState<Placement | null>(null);
  const [buyForm, setBuyForm] = useState({
    billingCycle: "MONTHLY" as "WEEKLY" | "MONTHLY",
    startsAt: new Date().toISOString().slice(0, 10),
    targetCountry: "",
    targetCategory: "",
    bannerImageUrl: "",
    bannerLinkUrl: "",
    bannerAltText: "",
  });
  const [buying, setBuying] = useState(false);
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null);

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok });
    setTimeout(() => setFlash(null), 4000);
  };

  useEffect(() => {
    if (!authLoading && session) {
      const role = session.role || "";
      if (!["EXPERT", "ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role)) {
        router.push("/dashboard");
      }
    }
  }, [session, authLoading, router]);

  const loadPlacements = useCallback(async () => {
    setLoadingPlacements(true);
    try {
      const res = await fetch("/api/admin/ad-placements");
      const data = await res.json();
      if (data.placements) setPlacements(data.placements.filter((p: Placement & { active?: boolean }) => p.active !== false));
    } catch {
      showFlash("Failed to load ad spots", false);
    } finally {
      setLoadingPlacements(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch("/api/me/ad-campaigns");
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch {
      showFlash("Failed to load campaigns", false);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => { loadPlacements(); }, [loadPlacements]);
  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  async function submitCampaign() {
    if (!buyModal) return;
    setBuying(true);
    try {
      const res = await fetch("/api/me/ad-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placementId: buyModal.id,
          billingCycle: buyForm.billingCycle,
          startsAt: buyForm.startsAt,
          targetCountry: buyForm.targetCountry || null,
          targetCategory: buyForm.targetCategory || null,
          bannerImageUrl: buyForm.bannerImageUrl || null,
          bannerLinkUrl: buyForm.bannerLinkUrl || null,
          bannerAltText: buyForm.bannerAltText || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFlash(buyModal.requiresApproval ? "Campaign submitted — pending admin approval" : "Campaign activated!");
        setBuyModal(null);
        loadCampaigns();
        setTab("my-campaigns");
      } else {
        showFlash(data.error || "Failed to create campaign", false);
      }
    } catch {
      showFlash("Something went wrong", false);
    } finally {
      setBuying(false);
    }
  }

  async function cancelCampaign(id: number) {
    try {
      const res = await fetch(`/api/me/ad-campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showFlash("Campaign cancelled");
        loadCampaigns();
      } else {
        const d = await res.json();
        showFlash(d.error || "Failed to cancel", false);
      }
    } catch {
      showFlash("Failed to cancel", false);
    }
  }

  function openBuy(p: Placement) {
    setBuyModal(p);
    setBuyForm({
      billingCycle: "MONTHLY",
      startsAt: new Date().toISOString().slice(0, 10),
      targetCountry: "",
      targetCategory: "",
      bannerImageUrl: "",
      bannerLinkUrl: "",
      bannerAltText: "",
    });
  }

  const needsTargeting = (spot: AdSpot) => ["COUNTRY_FEATURED", "CATEGORY_FEATURED"].includes(spot);
  const needsBanner = (spot: AdSpot) => spot === "BANNER_TOP";

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {flash && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium border shadow-xl ${
          flash.ok ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"
        }`}>
          {flash.text}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/20">
          <MdCampaign className="text-orange-400 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Promote Your Profile</h1>
          <p className="text-sm text-slate-400">Buy featured placements to get more visibility and leads</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-800/50 border border-white/8 rounded-2xl p-1 w-fit">
        {(["browse", "my-campaigns"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 px-5 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t === "browse" ? "Browse Spots" : "My Campaigns"}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <>
          {loadingPlacements ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {placements.map((p) => {
                const slotsLeft = p.maxSlots > 0 ? p.maxSlots - p._count.campaigns : null;
                const full = slotsLeft !== null && slotsLeft <= 0;
                return (
                  <div
                    key={p.id}
                    className={`bg-gradient-to-br ${SPOT_COLORS[p.spot]} border rounded-2xl p-5 flex flex-col gap-4 transition-all ${full ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl bg-slate-900/60 ${SPOT_ICON_COLORS[p.spot]}`}>
                        {SPOT_ICONS[p.spot]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">{p.label}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{p.description || getSpotDescription(p.spot)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-900/40 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs text-slate-500 mb-0.5">Weekly</p>
                        <p className="text-base font-bold text-white">${p.weeklyPrice}</p>
                      </div>
                      <div className="flex-1 bg-slate-900/40 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs text-slate-500 mb-0.5">Monthly</p>
                        <p className="text-base font-bold text-orange-400">${p.monthlyPrice}</p>
                      </div>
                    </div>

                    {slotsLeft !== null && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${full ? "bg-red-400" : slotsLeft <= 2 ? "bg-yellow-400" : "bg-green-400"}`} />
                        <span className={full ? "text-red-400" : slotsLeft <= 2 ? "text-yellow-400" : "text-slate-400"}>
                          {full ? "Fully booked" : `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} available`}
                        </span>
                      </div>
                    )}

                    {p.requiresApproval && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                        <MdInfoOutline className="shrink-0" />
                        Requires admin approval
                      </div>
                    )}

                    <button
                      onClick={() => openBuy(p)}
                      disabled={full}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        full
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-400 text-white"
                      }`}
                    >
                      {full ? "Fully Booked" : "Book This Spot"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "my-campaigns" && (
        <div className="bg-slate-800/50 border border-white/8 rounded-2xl overflow-hidden">
          {loadingCampaigns ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <MdCampaign className="text-5xl mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No campaigns yet</p>
              <p className="text-xs mt-1">Book a spot to start promoting your profile</p>
              <button
                onClick={() => setTab("browse")}
                className="mt-4 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors"
              >
                Browse Spots
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {campaigns.map((c) => (
                <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`p-2 rounded-xl bg-slate-900/60 ${SPOT_ICON_COLORS[c.placement.spot]}`}>
                    {SPOT_ICONS[c.placement.spot]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white text-sm">{c.placement.label}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(c.startsAt)} → {formatDate(c.endsAt)} · {c.billingCycle} · ${c.amountPaid}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-center shrink-0">
                    <div>
                      <p className="text-xs text-slate-500">Impressions</p>
                      <p className="text-sm font-semibold text-white">{c.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Clicks</p>
                      <p className="text-sm font-semibold text-orange-400">{c.clicks.toLocaleString()}</p>
                    </div>
                  </div>
                  {["PENDING", "PAUSED"].includes(c.status) && (
                    <button
                      onClick={() => cancelCampaign(c.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs font-medium border border-white/8 hover:border-red-500/30 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {buyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBuyModal(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold text-white text-lg">Book Ad Spot</h3>
                <p className={`text-sm mt-0.5 ${SPOT_ICON_COLORS[buyModal.spot]}`}>{buyModal.label}</p>
              </div>
              <button onClick={() => setBuyModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <MdClose />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Billing Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["WEEKLY", "MONTHLY"] as const).map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBuyForm((f) => ({ ...f, billingCycle: cycle }))}
                      className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                        buyForm.billingCycle === cycle
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-slate-800/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <p>{cycle === "WEEKLY" ? "Weekly" : "Monthly"}</p>
                      <p className="text-lg font-bold mt-0.5 text-white">
                        ${cycle === "WEEKLY" ? buyModal.weeklyPrice : buyModal.monthlyPrice}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={buyForm.startsAt}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBuyForm((f) => ({ ...f, startsAt: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {needsTargeting(buyModal.spot) && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Target Country <span className="text-slate-600">(ISO code, e.g. bd — leave blank for all)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={buyForm.targetCountry}
                      onChange={(e) => setBuyForm((f) => ({ ...f, targetCountry: e.target.value.toLowerCase() }))}
                      placeholder="bd, ae, us…"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Target Category Slug <span className="text-slate-600">(leave blank for all)</span>
                    </label>
                    <input
                      type="text"
                      value={buyForm.targetCategory}
                      onChange={(e) => setBuyForm((f) => ({ ...f, targetCategory: e.target.value.toLowerCase() }))}
                      placeholder="web-design, photography…"
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {needsBanner(buyModal.spot) && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Banner Image URL</label>
                    <input
                      type="url"
                      value={buyForm.bannerImageUrl}
                      onChange={(e) => setBuyForm((f) => ({ ...f, bannerImageUrl: e.target.value }))}
                      placeholder="https://…"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Banner Link URL</label>
                    <input
                      type="url"
                      value={buyForm.bannerLinkUrl}
                      onChange={(e) => setBuyForm((f) => ({ ...f, bannerLinkUrl: e.target.value }))}
                      placeholder="https://…"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Alt Text</label>
                    <input
                      type="text"
                      value={buyForm.bannerAltText}
                      onChange={(e) => setBuyForm((f) => ({ ...f, bannerAltText: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {buyModal.requiresApproval && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                  <MdInfoOutline className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300">This spot requires admin approval. Your campaign will be reviewed before going live.</p>
                </div>
              )}

              <div className="bg-slate-800/60 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-300">Total due now</span>
                <span className="text-lg font-bold text-orange-400">
                  ${buyForm.billingCycle === "WEEKLY" ? buyModal.weeklyPrice : buyModal.monthlyPrice} USD
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setBuyModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/8 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitCampaign}
                disabled={buying}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors disabled:opacity-50"
              >
                {buying ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <MdCheck />
                )}
                {buyModal.requiresApproval ? "Submit for Approval" : "Activate Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSpotDescription(spot: AdSpot): string {
  const d: Record<AdSpot, string> = {
    BANNER_TOP:       "Sitewide top banner — maximum exposure across all pages",
    SEARCH_SPONSOR:   "Appear as #1 in search results with a Sponsored badge",
    HOME_FEATURED:    "Featured in the global homepage expert grid",
    COUNTRY_FEATURED: "Highlighted on a specific country's landing page",
    CATEGORY_FEATURED:"Featured at the top of a category listing page",
    PROFILE_SIDEBAR:  "Appear in the 'Similar Experts' sidebar on profiles",
    MAP_FEATURED:     "Stand out on the interactive map with a highlighted pin",
  };
  return d[spot];
}
