import Link from 'next/link';
import { Crown, Star } from 'lucide-react';

export interface StaticFeaturedExpert {
  campaignId: number;
  expertSlug: string;
  expertName: string;
  profilePic: string | null;
  countryCode: string | null;
  categories: string[];
  avgRating: number | null;
}

interface Props {
  experts: StaticFeaturedExpert[];
  title?: string;
  className?: string;
}

export default function AdFeaturedExpertsStatic({
  experts,
  title = 'Featured Experts',
  className = '',
}: Props) {
  if (experts.length === 0) return null;

  const profileUrl = (e: StaticFeaturedExpert) =>
    `/${e.countryCode ?? 'bd'}/expert/${e.expertSlug}`;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
            prefetch
            className="group rounded-2xl border border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all p-4 flex flex-col items-center text-center gap-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
              {e.profilePic ? (
                <img src={e.profilePic} alt={e.expertName} className="w-full h-full object-cover" />
              ) : (
                e.expertName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                {e.expertName}
              </p>
              {e.categories[0] && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{e.categories[0]}</p>
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
