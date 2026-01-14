// File: src/app/page.tsx

/**
 * src/app/page.tsx
 *
 * Purpose:
 * --------
 * Public-facing landing page inspired by ShopWave.
 * Includes hero, features, category showcase, and footer.
 */

import { prisma } from "@/lib/db";
import Link from "next/link";
import Hero from "@/components/Hero";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: { showOnHomepage: true },
    orderBy: { name: "asc" },
  });

  return (
    <main>
      <Hero />

      {/* ✅ Feature Highlights */}
      {/* ... same as before */}

      {/* ✅ Category Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-[#f9e5e5] p-4 text-center hover:border-[#b84c4c]"
            >
              <div className="text-lg font-semibold text-gray-800">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f9e5e5]/70 border-t border-[#e0c0c0] py-6 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} ExpertNear.Me — All rights reserved.
      </footer>
    </main>
  );
}
