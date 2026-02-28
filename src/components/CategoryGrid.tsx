// src/components/CategoryGrid.tsx
import Link from 'next/link';
import { useState } from 'react';

interface CategoryGridProps {
  categories: Array<{ id: string; name: string; icon?: string; color?: string }>;
  countryCode: string;
}

export default function CategoryGrid({ categories, countryCode }: CategoryGridProps) {
  const [showMore, setShowMore] = useState(false);
  const visibleCategories = showMore ? categories : categories.slice(0, 6);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleCategories.map((category) => (
          <Link
            key={category.id}
            href={`/${countryCode}/categories/${category.id}`}
            className="group bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-all"
          >
            <div className="mb-3 text-3xl">
              <span className="text-[#b84c4c] group-hover:text-[#a33a3a]">
                {category.icon || '🏷️'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#b84c4c] transition-colors">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>

      {categories.length > 6 && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-6 px-4 py-2 bg-[#b84c4c] text-white rounded hover:bg-[#a33a3a] transition-colors"
        >
          {showMore ? "Show Less" : `Show All (${categories.length})`}
        </button>
      )}
    </div>
  );
}