'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  expertCount: number;
}

interface Props {
  categories: CategoryItem[];
  countryCode: string;
  initialCount?: number;
  batchSize?: number;
}

export default function CategoryGrid({
  categories,
  countryCode,
  initialCount = 20,
  batchSize = 20,
}: Props) {
  const [visible, setVisible] = useState(initialCount);
  const shown = categories.slice(0, visible);
  const remaining = categories.length - visible;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {shown.map((cat) => (
          <Link
            key={cat.id}
            href={`/${countryCode}/categories/${cat.slug}`}
            prefetch={false}
            className="rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/50 hover:border-orange-200 dark:hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-slate-800/80 p-4 text-center transition-all group shadow-sm dark:shadow-none"
          >
            <div className="text-2xl mb-2">{cat.icon || '🏢'}</div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-white transition-colors leading-tight">
              {cat.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
              {cat.expertCount} expert{cat.expertCount !== 1 ? 's' : ''}
            </p>
          </Link>
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + batchSize)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/30 bg-white dark:bg-slate-800/50 px-6 py-2.5 rounded-xl transition-all shadow-sm dark:shadow-none"
          >
            <ChevronDown className="w-4 h-4" />
            Load more ({remaining} remaining)
          </button>
        </div>
      )}
    </div>
  );
}