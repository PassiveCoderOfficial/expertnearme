// src/app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MapPin, Star, Filter } from "lucide-react";

interface Provider {
  id: number;
  name: string;
  phone?: string;
  shortDesc?: string;
  officeAddress?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  category: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  reviews: {
    rating: number;
  }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

export default function SearchPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [radius, setRadius] = useState(10); // km
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInitialData();
    getUserLocation();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, providersData] = await Promise.all([
        prisma.category.findMany({
          where: { active: true },
          orderBy: { name: "asc" }
        }),
        prisma.expert.findMany({
          where: { verified: true },
          include: {
            categories: {
              include: {
                category: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        })
      ]);

      setCategories(categoriesData);
      
      const transformedProviders = providersData.map(expert => {
        const category = expert.categories[0]?.category;
        const averageRating = expert.reviews.length > 0 
          ? expert.reviews.reduce((sum, review) => sum + review.rating, 0) / expert.reviews.length 
          : 0;
        
        return {
          id: expert.id,
          name: expert.name,
          phone: expert.phone,
          shortDesc: expert.shortDesc,
          officeAddress: expert.officeAddress,
          latitude: expert.latitude,
          longitude: expert.longitude,
          category: category || {
            id: 0,
            name: 'Uncategorized',
            slug: 'uncategorized',
            color: '#666666'
          },
          reviews: expert.reviews.map(r => ({ rating: r.rating }))
        };
      });

      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const filterProviders = () => {
    let filtered = providers;

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.officeAddress?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(provider => 
        provider.category.slug === selectedCategory
      );
    }

    // Apply distance filter
    if (userLocation && (provider.latitude && provider.longitude)) {
      filtered = filtered.filter(provider => {
        if (!provider.latitude || !provider.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          provider.latitude,
          provider.longitude
        );
        provider.distance = distance;
        return distance <= radius;
      });
    }

    // Sort by distance if location is available
    if (userLocation) {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return filtered;
  };

  const filteredProviders = filterProviders();

  const getAverageRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search experts, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={5}>Within 5km</option>
                  <option value={10}>Within 10km</option>
                  <option value={20}>Within 20km</option>
                  <option value={50}>Within 50km</option>
                </select>
              </div>
              
              {userLocation && (
                <div className="text-sm text-gray-600">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Location detected
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results
            <span className="text-gray-500 text-lg ml-2">
              ({filteredProviders.length} found)
            </span>
          </h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No providers found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setRadius(10);
              }}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => {
              const averageRating = getAverageRating(provider.reviews);
              
              return (
                <div key={provider.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {provider.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{provider.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium" style={{ color: provider.category.color || '#666666' }}>
                          {provider.category.name}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {provider.distance && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {provider.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {provider.shortDesc && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {provider.shortDesc}
                    </p>
                  )}
                  
                  {provider.officeAddress && (
                    <p className="text-gray-600 text-sm mb-4 flex items-start gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{provider.officeAddress}</span>
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/provider/${provider.id}`}
                      className="flex-1 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
                    >
                      View Profile
                    </Link>
                    {provider.phone && (
                      <a
                        href={`tel:${provider.phone}`}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        📞
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}