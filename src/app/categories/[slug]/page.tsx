'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Shield, Crown, Users, ArrowLeft } from 'lucide-react';

interface Expert {
  id: number;
  name: string;
  businessName?: string | null;
  profileLink?: string | null;
  profilePicture?: string | null;
  shortDesc?: string | null;
  featured?: boolean;
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function CategorySlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';

  const [category, setCategory] = useState<Category | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/categories/by-slug/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.category) setCategory(d.category);
        if (Array.isArray(d.experts)) setExperts(d.experts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center px-4">
        <div>
          <p className="text-slate-400 mb-4">Category not found.</p>
          <Link href="/categories" className="text-orange-400 hover:text-orange-300 transition-colors text-sm">
            ← All Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white pt-16">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-orange-400 transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-white">{category.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          {category.icon && <span className="text-4xl">{category.icon}</span>}
          <h1 className="text-3xl font-bold text-white">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-slate-400 text-sm mb-2 max-w-2xl">{category.description}</p>
        )}
        <div className="flex items-center gap-2 mb-10 text-xs text-slate-500">
          <Users className="w-3.5 h-3.5" />
          {experts.length} expert{experts.length !== 1 ? 's' : ''} listed
        </div>

        {/* Experts */}
        {experts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
            <p className="text-slate-400 text-sm mb-4">No experts listed in this category yet.</p>
            <Link href="/for-experts" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
              Be the first to list here →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {experts.map((expert) => {
              const displayName = expert.businessName || expert.name;
              return (
                <Link
                  key={expert.id}
                  href={`/bd/expert/${expert.profileLink || expert.id}`}
                  className="rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/70 transition-colors group p-5 flex items-center gap-3"
                >
                  {expert.profilePicture ? (
                    <img src={expert.profilePicture} alt={displayName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold shrink-0">
                      {initials(displayName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-white text-sm truncate group-hover:text-orange-300 transition-colors">
                        {displayName}
                      </p>
                      {expert.featured && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    {expert.shortDesc && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{expert.shortDesc}</p>
                    )}
                  </div>
                  <span className="text-xs text-orange-400 group-hover:text-orange-300 transition-colors shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all categories
          </Link>
        </div>
      </div>
    </div>
  );
}
