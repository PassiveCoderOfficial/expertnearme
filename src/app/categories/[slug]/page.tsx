'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Star, Clock, ArrowLeft, Search, Filter } from 'lucide-react';
import MobileFirstExpertCard from '@/components/MobileFirstExpertCard';
import { useDebounce } from '@/hooks/use-debounce';

interface Expert {
  id: number;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  categories: Array<{
    category: {
      id: number;
      name: string;
      slug: string;
      color: string;
      icon: string;
    }
  }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  expertCount: number;
}

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'recent' | 'distance'>('rating');
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchCategoryAndExperts = async () => {
      try {
        // Fetch category details
        const categoryRes = await fetch(`/api/categories/category-slug/${params.slug}`);
        if (!categoryRes.ok) {
          throw new Error('Category not found');
        }
        const categoryData = await categoryRes.json();
        setCategory(categoryData);

        // Fetch experts in this category
        const expertsRes = await fetch(`/api/categories/category-slug/${params.slug}/experts-route`);
        if (!expertsRes.ok) {
          throw new Error('Failed to fetch experts');
        }
        const expertsData = await expertsRes.json();
        setExperts(expertsData);
        setFilteredExperts(expertsData);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndExperts();
  }, [params.slug]);

  // Filter and sort experts
  useEffect(() => {
    let filtered = [...experts];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(expert =>
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'distance':
          // This would require user location, for now sort by rating
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredExperts(filtered);
  }, [experts, searchQuery, sortBy]);

  const handleExpertClick = (expert: Expert) => {
    setSelectedExpert(expert);
  };

  const handleCloseModal = () => {
    setSelectedExpert(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experts...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <Link href="/categories" className="text-blue-500 hover:text-blue-600">
            ← Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/categories"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600">{category.expertCount} experts available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search experts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="recent">Sort by Recent</option>
                <option value="distance">Sort by Distance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {category.description && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">{category.name}</h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Experts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No experts found in this category</div>
            <p className="text-gray-600">Try adjusting your search or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleExpertClick(expert)}
              >
                <MobileFirstExpertCard
                  expert={expert}
                  countryCode="bd"
                  compact={true}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Expert Detail Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedExpert.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {selectedExpert.rating || 'No rating'} ({selectedExpert.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Joined {new Date(selectedExpert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedExpert.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{selectedExpert.description}</p>
                    </div>
                  )}

                  {selectedExpert.address && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedExpert.address}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                    <div className="space-y-2">
                      {selectedExpert.phone && (
                        <div className="text-gray-600">
                          <span className="font-medium">Phone:</span> {selectedExpert.phone}
                        </div>
                      )}
                      {selectedExpert.email && (
                        <div className="text-gray-600">
                          <span className="font-medium">Email:</span> {selectedExpert.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Categories</h4>
                    <div className="flex gap-2">
                      {selectedExpert.categories.map((cat) => (
                        <span
                          key={cat.category.id}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: cat.category.color ? `${cat.category.color}20` : '#3b82f620',
                            color: cat.category.color || '#3b82f6'
                          }}
                        >
                          {cat.category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    Contact Expert
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}