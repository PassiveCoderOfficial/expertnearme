/**
 * src/app/categories/page.tsx
 *
 * Purpose:
 * --------
 * Public page displaying all categories in a responsive grid:
 * - 6 columns on desktop (xl+)
 * - 3 columns on tablets (md)
 * - 2 columns on phones (sm)
 *
 * Behavior:
 * ---------
 * - Fetches categories (tree) from /api/categories
 * - Flattens to a single list for grid display
 * - Each card is clickable, linking to /categories/[slug]
 * - If no categories exist, shows a friendly empty state
 *
 * Visuals:
 * --------
 * - Rounded corner cards
 * - Decorative gradient overlay as background (no image field yet)
 * - Category name and slug displayed
 */

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CategoryCard from '@/components/CategoryCard';

type Cat = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: Cat[];
};

export default function CategoriesPage() {
  const [tree, setTree] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setTree(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Flatten parent-child into a single list
  const flatList = useMemo(() => {
    const out: Cat[] = [];
    const walk = (nodes: Cat[]) => {
      nodes.forEach((n) => {
        out.push({ ...n, children: undefined });
        if (n.children?.length) walk(n.children);
      });
    };
    walk(tree);
    return out;
  }, [tree]);

  const Card = ({ cat }: { cat: Cat }) => {
    return (
      <Link
        href={`/categories/${cat.slug}`}
        className="relative block rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200" />
        <div className="relative p-4 h-28 flex flex-col justify-center">
          <div className="text-lg font-semibold text-gray-900">{cat.name}</div>
          <div className="text-xs text-gray-500">Slug: {cat.slug}</div>
        </div>
      </Link>
    );
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      {loading ? (
        <p className="text-gray-500 italic">Loading categories...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : flatList.length === 0 ? (
        <div className="border border-gray-300 rounded p-4 text-center text-gray-600">
          <p className="mb-2">No categories found.</p>
          <p>Go to Manage Categories to create your first category.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">

            {flatList.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
            ))}

        </div>
      )}
    </main>
  );
}
