/**
 * src/app/categories/[slug]/page.tsx
 *
 * Purpose:
 * --------
 * Show providers for a single category by slug.
 * Fixes the "params is a Promise" error by unwrapping params properly.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Provider = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

type CategoryDetail = {
  id: number;
  name: string;
  slug: string;
  providers: Provider[];
};

export default function CategoryDetailPage(props: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ unwrap params once component mounts
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
          json.providers = Array.isArray(json.providers) ? json.providers : [];
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

          {data.providers.length === 0 ? (
            <div className="border border-gray-300 rounded p-4 text-center text-gray-600">
              <p>No providers listed under this category yet.</p>
              <p className="mt-2">
                <Link className="text-blue-600 hover:underline" href="/providers/new">
                  Add a provider
                </Link>
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.providers.map((p) => (
                <li key={p.id} className="border border-gray-200 rounded p-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.email}</div>
                  {p.phone && <div className="text-sm text-gray-600">Phone: {p.phone}</div>}
                  <Link href={`/providers/${p.id}`} className="text-blue-600 hover:underline mt-1 inline-block">
                    View provider
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
