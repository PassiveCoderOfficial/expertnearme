/**
 * src/components/CategoryCard.tsx
 *
 * Purpose:
 * --------
 * Reusable category card with rounded corners, gradient background, and click-through link.
 */

import Link from 'next/link';

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoryCard({ cat }: { cat: Category }) {
  return (
    <Link
      href={`/categories/${cat.slug}`}
      className="relative block rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200" />
      <div className="relative p-4 h-28 flex flex-col justify-center">
        <div className="text-lg font-semibold text-gray-900">{cat.name}</div>
        <div className="text-xs text-gray-500">Slug: {cat.slug}</div>
      </div>
    </Link>
  );
}
