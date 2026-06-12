"use client";

import { useEffect, useState } from "react";
import {
  MdPeople, MdPerson, MdVerified, MdStar, MdCalendarToday, MdRateReview,
  MdArticle, MdCampaign, MdGroupAdd, MdTrendingUp,
} from "react-icons/md";

type Analytics = {
  experts: { total: number; verified: number; founding: number; foundingTotal: number };
  users: { total: number; new30: number };
  bookings: { total: number; new30: number };
  reviews: { total: number };
  waitlist: { total: number };
  blog: { published: number; views: number };
  ads: { impressions: number; clicks: number; ctr: number; activeCampaigns: number };
  expertsByCountry: { country: string; count: number }[];
  topCategories: { name: string; count: number }[];
  recentSignups: { id: number; name: string | null; email: string; role: string; createdAt: string }[];
};

const card = "bg-slate-800/60 border border-white/8 rounded-2xl p-5";

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className={card}>
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
        <span className="text-orange-400 text-lg">{icon}</span>
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400 font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-slate-400">Loading analytics…</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!data) return null;

  const maxCountry = Math.max(1, ...data.expertsByCountry.map(c => c.count));
  const maxCat = Math.max(1, ...data.topCategories.map(c => c.count));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MdTrendingUp className="text-orange-400" /> Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">Platform growth, engagement, and ad performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<MdPerson />} label="Experts" value={data.experts.total} sub={`${data.experts.verified} verified`} />
        <Stat icon={<MdStar />} label="Founding" value={`${data.experts.founding} / ${data.experts.foundingTotal}`} sub={`${data.experts.foundingTotal - data.experts.founding} spots left`} />
        <Stat icon={<MdPeople />} label="Users" value={data.users.total} sub={`+${data.users.new30} last 30d`} />
        <Stat icon={<MdGroupAdd />} label="Waitlist" value={data.waitlist.total} sub="pre-launch leads" />
        <Stat icon={<MdCalendarToday />} label="Bookings" value={data.bookings.total} sub={`+${data.bookings.new30} last 30d`} />
        <Stat icon={<MdRateReview />} label="Reviews" value={data.reviews.total} />
        <Stat icon={<MdArticle />} label="Blog views" value={data.blog.views} sub={`${data.blog.published} published`} />
        <Stat icon={<MdCampaign />} label="Ad CTR" value={`${data.ads.ctr.toFixed(1)}%`} sub={`${data.ads.clicks} clicks / ${data.ads.impressions} impr · ${data.ads.activeCampaigns} active`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className={card}>
          <h2 className="text-sm font-semibold text-white mb-4">Experts by Country</h2>
          <div className="space-y-3">
            {data.expertsByCountry.length === 0 && <p className="text-xs text-slate-500">No data.</p>}
            {data.expertsByCountry.map(c => <Bar key={c.country} label={c.country.toUpperCase()} value={c.count} max={maxCountry} />)}
          </div>
        </div>
        <div className={card}>
          <h2 className="text-sm font-semibold text-white mb-4">Top Categories</h2>
          <div className="space-y-3">
            {data.topCategories.length === 0 && <p className="text-xs text-slate-500">No data.</p>}
            {data.topCategories.map(c => <Bar key={c.name} label={c.name} value={c.count} max={maxCat} />)}
          </div>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-sm font-semibold text-white mb-4">Recent Signups</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-white/8">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSignups.map(u => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 text-white">{u.name || "—"}</td>
                  <td className="py-2.5 text-slate-400">{u.email}</td>
                  <td className="py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300">{u.role}</span></td>
                  <td className="py-2.5 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
