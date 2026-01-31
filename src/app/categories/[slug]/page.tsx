// File: src/app/categories/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Expert = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  profileLink?: string | null;
};

type CategoryDetail = {
  id: number;
  name: string;
  slug: string;
  experts: Expert[];
};

export default function CategoryDetailPage(props: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // unwrap params once component mounts
  useEffect(() => {
    (async () => {
      const { slug } = await props.params;
      setSlug(slug);
    })();
  }, [props.params]);

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/categories/by-slug/${slug}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error || 'Failed to load category');
          setData(null);
        } else {
          json.experts = Array.isArray(json.experts) ? json.experts : [];
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch category detail:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {loading ? (
        <p className="text-gray-500 italic">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : !data ? (
        <p className="text-gray-600">No category found.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
          <p className="text-sm text-gray-500 mb-6">Slug: {data.slug}</p>

          {data.experts.length === 0 ? (
            <div className="border border-gray-300 rounded p-4 text-center text-gray-600">
              <p>No experts listed under this category yet.</p>
              <p className="mt-2">
                <Link className="text-blue-600 hover:underline" href="/experts/new">
                  Add an expert
                </Link>
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.experts.map((e) => (
                <li key={e.id} className="border border-gray-200 rounded p-3">
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-sm text-gray-600">{e.email}</div>
                  {e.phone && <div className="text-sm text-gray-600">Phone: {e.phone}</div>}

                  {/* Prefer profileLink at root; fallback to admin edit if missing */}
                  {e.profileLink ? (
                    <Link href={`/${e.profileLink}`} className="text-blue-600 hover:underline mt-1 inline-block">
                      View profile
                    </Link>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">Missing slug</span>
                      <Link href={`/dashboard/experts/${e.id}`} className="text-sm text-blue-600 hover:underline">
                        Edit expert
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
