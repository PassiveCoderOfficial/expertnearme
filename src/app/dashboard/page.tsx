"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  MdPeople, MdPerson, MdCalendarToday, MdRateReview, MdStar,
  MdVerified, MdTrendingUp, MdOpenInNew, MdEdit,
} from "react-icons/md";
import { Crown } from "lucide-react";

interface AdminStats {
  role: "ADMIN";
  totalExperts: number;
  totalUsers: number;
  totalBookings: number;
  totalReviews: number;
  foundingExperts: number;
  recentExperts: { id: number; name: string; businessName: string | null; countryCode: string | null; verified: boolean; createdAt: string }[];
}

interface ExpertStats {
  role: "EXPERT";
  expert: { id: number; name: string; businessName: string | null; countryCode: string | null; profileLink: string | null; verified: boolean; foundingExpert: boolean; shortDesc: string | null } | null;
  bookings: number;
  reviewCount: number;
  avgRating: number | null;
}

interface UserStats {
  role: "USER";
  bookings: number;
}

type Stats = AdminStats | ExpertStats | UserStats;

function StatCard({ label, value, icon, accent = false }: { label: string; value: string | number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${accent ? "bg-orange-500/10 border-orange-500/25" : "bg-slate-800/50 border-white/8"}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${accent ? "bg-orange-500/20 text-orange-400" : "bg-slate-700/60 text-slate-400"}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold ${accent ? "text-orange-400" : "text-white"}`}>{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── ADMIN ── */
  if (stats?.role === "ADMIN") {
    return (
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting()}, Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s what&apos;s happening on ExpertNear.Me</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Experts" value={stats.totalExperts} icon={<MdPerson />} />
          <StatCard label="Total Users" value={stats.totalUsers} icon={<MdPeople />} />
          <StatCard label="Bookings" value={stats.totalBookings} icon={<MdCalendarToday />} />
          <StatCard label="Reviews" value={stats.totalReviews} icon={<MdRateReview />} />
          <StatCard label="Founding Experts" value={stats.foundingExperts} icon={<Crown className="w-5 h-5" />} accent />
          <StatCard label="Spots Remaining" value={Math.max(0, 500 - stats.foundingExperts)} icon={<MdTrendingUp />} accent />
        </div>

        {/* Recent Experts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recently Joined Experts</h2>
            <Link href="/dashboard/experts" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Country</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Joined</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentExperts.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{e.businessName || e.name}</td>
                    <td className="px-5 py-3 text-slate-400 hidden sm:table-cell uppercase text-xs">{e.countryCode || "—"}</td>
                    <td className="px-5 py-3 text-slate-400 hidden md:table-cell">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {e.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <MdVerified /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Manage Experts", href: "/dashboard/experts" },
              { label: "Manage Countries", href: "/dashboard/countries" },
              { label: "Categories", href: "/dashboard/categories" },
              { label: "Site Settings", href: "/dashboard/settings" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-xl border border-white/8 bg-slate-800/40 hover:border-orange-500/30 hover:bg-slate-800/70 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors text-center"
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── EXPERT ── */
  if (stats?.role === "EXPERT") {
    const { expert, bookings, reviewCount, avgRating } = stats;
    const profileUrl = expert?.countryCode && expert?.profileLink
      ? `/${expert.countryCode}/expert/${expert.profileLink}`
      : null;

    return (
      <div className="space-y-8 max-w-3xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting()}, {expert?.businessName || expert?.name || "Expert"}</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your profile and track your performance</p>
          </div>
          {profileUrl && (
            <Link
              href={profileUrl}
              target="_blank"
              className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 border border-orange-500/25 hover:border-orange-500/50 px-4 py-2 rounded-xl transition-colors"
            >
              <MdOpenInNew /> View Profile
            </Link>
          )}
        </div>

        {expert?.foundingExpert && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/25 rounded-2xl px-5 py-4">
            <Crown className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Founding Expert</p>
              <p className="text-xs text-slate-400">You&apos;re one of the first 500 — honored permanently on the platform.</p>
            </div>
            <Link href="/founding-experts" className="ml-auto text-xs text-orange-400 hover:text-orange-300 whitespace-nowrap">
              Hall of Fame →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Bookings" value={bookings} icon={<MdCalendarToday />} />
          <StatCard label="Reviews" value={reviewCount} icon={<MdRateReview />} />
          <StatCard
            label="Avg Rating"
            value={avgRating !== null ? `${avgRating.toFixed(1)} ★` : "No reviews"}
            icon={<MdStar />}
            accent={avgRating !== null}
          />
        </div>

        {expert && (
          <div className="rounded-2xl border border-white/8 bg-slate-800/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Profile Status</h2>
              <Link href="/dashboard/profile" className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors">
                <MdEdit /> Edit Profile
              </Link>
            </div>
            <div className="space-y-2">
              {[
                { label: "Business name set", done: !!expert.businessName },
                { label: "Short description added", done: !!expert.shortDesc },
                { label: "Account verified", done: expert.verified },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${item.done ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-500"}`}>
                    {item.done ? "✓" : "·"}
                  </div>
                  <span className={item.done ? "text-slate-300" : "text-slate-500"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── USER ── */
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting()}</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome to your ExpertNear.Me dashboard</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="My Bookings" value={(stats as UserStats)?.bookings ?? 0} icon={<MdCalendarToday />} />
      </div>
      <div className="rounded-2xl border border-white/8 bg-slate-800/40 p-6 text-center">
        <p className="text-slate-400 text-sm mb-4">Looking for an expert? Browse professionals near you.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Find Experts →
        </Link>
      </div>
    </div>
  );
}
