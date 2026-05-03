"use client";

import { useEffect, useState } from "react";
import { MdStar, MdStarBorder, MdRefresh, MdSearch, MdMap, MdHome, MdVerified } from "react-icons/md";
import { Crown } from "lucide-react";

type Expert = {
  id: number;
  name: string;
  businessName: string | null;
  countryCode: string | null;
  profilePicture: string | null;
  shortDesc: string | null;
  verified: boolean;
  featured: boolean;
  homeFeatured: boolean;
  mapFeatured: boolean;
  foundingExpert: boolean;
  categories: { category: { name: string } }[];
};

function Avatar({ expert }: { expert: Expert }) {
  if (expert.profilePicture) {
    return <img src={expert.profilePicture} alt={expert.name} className="w-10 h-10 rounded-xl object-cover" />;
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-white/10 flex items-center justify-center text-sm font-bold text-orange-400">
      {expert.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

type FeaturedFlag = "featured" | "homeFeatured" | "mapFeatured";

export default function FeaturedPage() {
  const [experts, setExperts]   = useState<Expert[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [country, setCountry]   = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/dashboard/experts");
    const d = await r.json();
    const list: Expert[] = Array.isArray(d) ? d : [];
    setExperts(list);
    const codes = [...new Set(list.map(e => e.countryCode).filter(Boolean))] as string[];
    setCountries(codes);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: number, flag: FeaturedFlag, current: boolean) => {
    const key = `${id}-${flag}`;
    setToggling(key);
    await fetch(`/api/dashboard/experts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [flag]: !current }),
    });
    setExperts(prev => prev.map(e => e.id === id ? { ...e, [flag]: !current } : e));
    setToggling(null);
  };

  const filtered = experts.filter(e => {
    if (country && e.countryCode !== country) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) ||
             (e.businessName || "").toLowerCase().includes(q) ||
             e.categories.some(c => c.category.name.toLowerCase().includes(q));
    }
    return true;
  });

  const featuredCount   = experts.filter(e => e.featured).length;
  const homeCount       = experts.filter(e => e.homeFeatured).length;
  const mapCount        = experts.filter(e => e.mapFeatured).length;
  const founderCount    = experts.filter(e => e.foundingExpert).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Featured Experts</h1>
          <p className="text-slate-400 text-sm mt-0.5">Control which experts appear in featured slots across the platform.</p>
        </div>
        <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/8 rounded-lg text-slate-400 transition-colors">
          <MdRefresh />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Search Featured",  val: featuredCount,  icon: <MdStar />,   color: "text-orange-400" },
          { label: "Home Featured",    val: homeCount,      icon: <MdHome />,   color: "text-blue-400" },
          { label: "Map Featured",     val: mapCount,       icon: <MdMap />,    color: "text-green-400" },
          { label: "Founding Experts", val: founderCount,   icon: <Crown className="w-4 h-4" />, color: "text-amber-400" },
        ].map(c => (
          <div key={c.label} className="bg-slate-800/60 border border-white/8 rounded-xl p-4 flex items-center gap-3">
            <div className={`text-xl ${c.color}`}>{c.icon}</div>
            <div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.val}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <MdSearch className="text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search experts…"
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
          />
        </div>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expert</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center justify-center gap-1"><MdStar className="text-orange-400" />Search</span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center justify-center gap-1"><MdHome className="text-blue-400" />Homepage</span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center justify-center gap-1"><MdMap className="text-green-400" />Map</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No experts found.</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar expert={e} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-white">{e.name}</p>
                          {e.verified && <MdVerified className="text-blue-400 text-sm" />}
                          {e.foundingExpert && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-xs text-slate-500">
                          {e.categories.map(c => c.category.name).join(", ") || "No categories"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs uppercase">{e.countryCode || "—"}</td>
                  {(["featured", "homeFeatured", "mapFeatured"] as FeaturedFlag[]).map(flag => {
                    const active = e[flag];
                    const key = `${e.id}-${flag}`;
                    return (
                      <td key={flag} className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggle(e.id, flag, active)}
                          disabled={toggling === key}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center mx-auto transition-colors ${
                            active
                              ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                              : "bg-slate-700/40 border-white/8 text-slate-600 hover:text-slate-400"
                          } ${toggling === key ? "opacity-50 cursor-wait" : ""}`}
                        >
                          {active ? <MdStar className="text-lg" /> : <MdStarBorder className="text-lg" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
