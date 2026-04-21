'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X,
  SlidersHorizontal,
  RotateCcw,
  Clock,
  CheckCircle,
  Grid,
  List
} from 'lucide-react';
import Link from 'next/link';

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
  hourlyRate?: number;
  verified: boolean;
  available: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface EnhancedSearchProps {
  providers: Provider[];
  categories: Category[];
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

interface SearchFilters {
  query: string;
  selectedCategories: string[];
  priceRange: PriceRange;
  minRating: number;
  radius: number;
  userLocation?: { lat: number; lng: number };
  sortBy: 'distance' | 'rating' | 'price' | 'name';
  viewMode: 'grid' | 'list';
}

export default function EnhancedSearch({ 
  providers, 
  categories, 
  onSearch,
  className = ""
}: EnhancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });
  const [minRating, setMinRating] = useState(0);
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'name'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Initialize user location
  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    // Apply filters when they change
    applyFilters();
  }, [searchQuery, selectedCategories, priceRange, minRating, radius, sortBy, providers]);

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

  const applyFilters = () => {
    let filtered = providers;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.officeAddress?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(provider => 
        selectedCategories.includes(provider.category.slug)
      );
    }

    // Apply price filter
    filtered = filtered.filter(provider => {
      if (!provider.hourlyRate) return true;
      return provider.hourlyRate >= priceRange.min && provider.hourlyRate <= priceRange.max;
    });

    // Apply rating filter
    filtered = filtered.filter(provider => {
      const avgRating = provider.reviews.length > 0 
        ? provider.reviews.reduce((sum, review) => sum + review.rating, 0) / provider.reviews.length 
        : 0;
      return avgRating >= minRating;
    });

    // Apply distance filter
    if (userLocation) {
      filtered = filtered.filter(provider => {
        if (!provider.latitude || !provider.longitude) return true;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          provider.latitude,
          provider.longitude
        );
        if (radius > 0) {
          provider.distance = distance;
          return distance <= radius;
        }
        provider.distance = distance;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          const ratingA = a.reviews.length > 0 
            ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length 
            : 0;
          const ratingB = b.reviews.length > 0 
            ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length 
            : 0;
          return ratingB - ratingA;
        case 'price':
          if (!a.hourlyRate && !b.hourlyRate) return 0;
          if (!a.hourlyRate) return 1;
          if (!b.hourlyRate) return -1;
          return a.hourlyRate - b.hourlyRate;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    const filters: SearchFilters = {
      query: searchQuery,
      selectedCategories,
      priceRange,
      minRating,
      radius,
      userLocation,
      sortBy,
      viewMode
    };

    onSearch(filters);
  };

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug)
        ? prev.filter(slug => slug !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setMinRating(0);
    setRadius(10);
    setSortBy('rating');
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || 
                           priceRange.min > 0 || priceRange.max < 1000 || 
                           minRating > 0 || radius !== 10;

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Main Search Input */}
          <div className="flex-1 relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts, services, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>
        
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              ref={filterRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-6 overflow-hidden"
            >
              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Categories</h3>
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={() => setSelectedCategories([])}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.slug)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategories.includes(category.slug)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={category.color ? { backgroundColor: category.color + '20' } : {}}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color || '#3b82f6' }}></span>
                        {category.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Advanced Filters
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      showAdvancedFilters ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="space-y-6 pt-4">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price Range (¥/hr)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Min:</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                        />
                        <span className="text-sm text-gray-600">Max:</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Minimum Rating
                    </h3>
                    <div className="flex items-center gap-4">
                      {[0, 1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                            minRating >= rating
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{rating}+</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Distance (km)
                    </h3>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>5km</span>
                        <span className="font-medium">{radius} km</span>
                        <span>100km</span>
                      </div>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {[
                        { value: 'distance' as const, label: 'Distance' },
                        { value: 'rating' as const, label: 'Rating' },
                        { value: 'price' as const, label: 'Price' },
                        { value: 'name' as const, label: 'Name' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sortBy === option.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear all filters
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}