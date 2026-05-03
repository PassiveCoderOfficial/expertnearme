'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Star, MapPin } from 'lucide-react';

interface FeaturedExpert {
  id: number;
  expertId: number;
  expertName: string;
  expertSlug: string;
  profilePic: string | null;
  countryCode: string | null;
  categories: string[];
  avgRating: number | null;
  campaignId: number;
}

interface Props {
  spot: 'HOME_FEATURED' | 'COUNTRY_FEATURED' | 'CATEGORY_FEATURED' | 'PROFILE_SIDEBAR' | 'MAP_FEATURED';
  country?: string;
  category?: string;
  title?: string;
  className?: string;
  layout?: 'grid' | 'list' | 'compact';
}

export default function AdFeaturedExperts({
  spot,
  country,
  category,
  title = 'Featured Experts',
  className = '',
  layout = 'grid',
}: Props) {
  const [experts, setExperts] = useState<FeaturedExpert[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (category) params.set('category', category);

    fetch(`/api/ads/active?${params}`)
      .then((r) => r.json())
      .then((d) => {
        const list = d[spot];
        if (Array.isArray(list)) setExperts(list);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [spot, country, category]);

  const trackImpression = (campaignId: number) => {
    fetch(`/api/admin/ad-campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'impression' }),
    }).catch(() => {});
  };

  const trackClick = (campaignId: number) => {
    fetch(`/api/admin/ad-campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
  };

  useEffect(() => {
    experts.forEach((e) => trackImpression(e.campaignId));
  }, [experts]);

  if (!loaded || experts.length === 0) return null;

  const profileUrl = (e: FeaturedExpert) =>
    `/${e.countryCode ?? country ?? 'bd'}/expert/${e.expertSlug}`;

  if (layout === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Crown className="w-3 h-3 text-amber-400" /> {title}
        </p>
        {experts.map((e) => (
          <Link
            key={e.campaignId}
            href={profileUrl(e)}
            onClick={() => trackClick(e.campaignId)}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/60 dark:hover:bg-slate-800/60 hover:bg-slate-100 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
              {e.profilePic ? (
                <img src={e.profilePic} alt={e.expertName} className="w-full h-full object-cover" />
              ) : (
                e.expertName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white dark:text-white text-slate-900 truncate group-hover:text-orange-400 transition-colors">
                {e.expertName}
              </p>
              {e.categories[0] && (
                <p className="text-xs text-slate-500 truncate">{e.categories[0]}</p>
              )}
            </div>
            <span className="text-xs text-amber-400 font-medium shrink-0">Ad</span>
          </Link>
        ))}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white dark:text-white text-slate-900 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" /> {title}
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800/40 dark:bg-slate-800/40 bg-slate-100 px-2 py-0.5 rounded-full">Sponsored</span>
        </div>
        <div className="space-y-2">
          {experts.map((e) => (
            <Link
              key={e.campaignId}
              href={profileUrl(e)}
              onClick={() => trackClick(e.campaignId)}
              className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                {e.profilePic ? (
                  <img src={e.profilePic} alt={e.expertName} className="w-full h-full object-cover" />
                ) : (
                  e.expertName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white dark:text-white text-slate-900 group-hover:text-orange-400 transition-colors truncate">
                  {e.expertName}
                </p>
                {e.categories.length > 0 && (
                  <p className="text-xs text-slate-500 truncate">{e.categories.join(', ')}</p>
                )}
              </div>
              {e.avgRating !== null && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-slate-400">{e.avgRating.toFixed(1)}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // grid layout (default)
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white dark:text-white text-slate-900 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" /> {title}
        </h2>
        <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
          Sponsored
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {experts.map((e) => (
          <Link
            key={e.campaignId}
            href={profileUrl(e)}
            onClick={() => trackClick(e.campaignId)}
            className="group rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 bg-amber-50 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all p-4 flex flex-col items-center text-center gap-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
              {e.profilePic ? (
                <img src={e.profilePic} alt={e.expertName} className="w-full h-full object-cover" />
              ) : (
                e.expertName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white dark:text-white text-slate-900 group-hover:text-orange-400 transition-colors line-clamp-1">
                {e.expertName}
              </p>
              {e.categories[0] && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{e.categories[0]}</p>
              )}
            </div>
            {e.avgRating !== null && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-slate-400">{e.avgRating.toFixed(1)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
