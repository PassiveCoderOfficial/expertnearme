// src/app/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import MobileFirstHero from "@/components/MobileFirstHero";
import MapComponent from "@/components/map/MapComponent";
import MobileFirstCategoryGrid from "@/components/MobileFirstCategoryGrid";
import MobileFirstExpertCard from "@/components/MobileFirstExpertCard";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/ui/loading-skeleton";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const [categories, providers] = await Promise.all([
      prisma.category.findMany({
        where: { showOnHomepage: true },
        orderBy: { name: "asc" },
      }),
      prisma.expert.findMany({
        where: { verified: true },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 20 // Limit to 20 providers for performance
      })
    ]);

    // Transform providers data for the map
    const mapProviders = providers.map(expert => {
      const category = expert.categories[0]?.category;
      return {
        id: expert.id,
        name: expert.name,
        latitude: expert.latitude || 0,
        longitude: expert.longitude || 0,
        phone: expert.phone,
        category: category || {
          id: 0,
          name: 'Uncategorized',
          slug: 'uncategorized',
          color: '#666666'
        }
      };
    }).filter(provider => provider.latitude && provider.longitude);

    return (
      <main>
        <MobileFirstHero onScrollTo="categories" />

        {/* Interactive Map Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Experts Near You</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore verified professionals in your area. Click on pins to view details, or filter by category.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <MapComponent
              providers={mapProviders}
              categories={categories}
              height="500px"
            />
          </div>
        </section>

        {/* Category Showcase */}
        <section id="categories" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Categories</h2>
          <MobileFirstCategoryGrid 
            categories={categories} 
            countryCode="bd" 
          />
        </section>

        {/* Recent Experts */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Recently Added Experts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 6).map((expert, index) => (
              <MobileFirstExpertCard
                key={expert.id}
                expert={{
                  ...expert,
                  categories: expert.categories?.map(c => ({
                    id: c.category.id,
                    name: c.category.name,
                    color: c.category.color,
                    icon: c.category.icon
                  }))
                }}
                countryCode="bd"
                compact={true}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#f9e5e5]/70 border-t border-[#e0c0c0] py-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} ExpertNear.Me - All rights reserved.
        </footer>
      </main>
    );
  } catch (e) {
    console.error("HomePage error:", e);
    return (
      <main>
        <MobileFirstHero />
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Categories</h2>
          <p className="text-center text-gray-600">Categories unavailable at the moment.</p>
        </section>
        <footer className="bg-[#f9e5e5]/70 border-t border-[#e0c0c0] py-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} ExpertNear.Me - All rights reserved.
        </footer>
      </main>
    );
  }
}
