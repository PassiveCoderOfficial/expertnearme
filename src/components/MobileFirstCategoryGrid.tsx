'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Grid, 
  List, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Users, 
  Star,
  Filter,
  X,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Category {
  id: number | string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  expertCount?: number;
  slug: string;
  trending?: boolean;
}

interface MobileFirstCategoryGridProps {
  categories: Category[];
  countryCode: string;
  onCategorySelect?: (category: Category) => void;
  compact?: boolean;
}

interface CategoryCardProps {
  category: Category;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  compact: boolean;
}

// Memoized category card for better performance
const CategoryCard = memo(({ category, index, isSelected, onClick, compact }: CategoryCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50/80 shadow-lg transform scale-105' 
          : 'bg-white/95 hover:bg-white hover:shadow-xl hover:scale-105'
      }`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      {/* Performance-optimized background */}
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ 
          background: category.color 
            ? `linear-gradient(135deg, ${category.color}, ${category.color}40)` 
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
        }}
      />
      
      <div className="relative p-4 sm:p-6">
        {/* Icon with enhanced styling */}
        <div className="flex items-center justify-center mb-4">
          <div 
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 ${
              isSelected ? 'scale-110 ring-2 ring-white/50' : 'group-hover:scale-110'
            }`}
            style={{ 
              backgroundColor: category.color ? `${category.color}20` : '#3b82f620',
              color: category.color || '#3b82f6'
            }}
          >
            {category.icon || (
              <div className="text-center">
                <div className="text-lg font-bold">
                  {category.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category name */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
          {category.name}
        </h3>

        {/* Description (desktop only) */}
        {!compact && category.description && (
          <p className="text-sm text-gray-600 mb-3 text-center line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Expert count and stats */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {category.expertCount !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-3 h-3" />
              <span>{category.expertCount} {category.expertCount === 1 ? 'Expert' : 'Experts'}</span>
            </div>
          )}
          {category.trending && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Sparkles className="w-3 h-3" />
              <span>Trending</span>
            </div>
          )}
        </div>

        {/* Interactive button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
            isSelected 
              ? 'bg-blue-500 text-white' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSelected ? 'Selected' : 'View'}
        </motion.button>

        {/* Selection overlay */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Hover effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default function MobileFirstCategoryGrid({ 
  categories, 
  countryCode, 
  onCategorySelect,
  compact = false 
}: MobileFirstCategoryGridProps) {
  const [showMore, setShowMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [sortBy, setSortBy] = useState<'name' | 'experts' | 'trending'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const visibleCategories = showMore ? filteredCategories : filteredCategories.slice(0, compact ? 6 : 8);
  const isExpanded = showMore || filteredCategories.length <= (compact ? 6 : 8);

  // Performance optimization: Debounced search and filtering
  useEffect(() => {
    setIsLoading(true);
    
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'experts':
          return (b.expertCount || 0) - (a.expertCount || 0);
        case 'trending':
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return 0;
        default: // name
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredCategories(sorted);
    setIsLoading(false);
  }, [debouncedSearchQuery, categories, sortBy]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
    onCategorySelect?.(category);
  };

  const CategoryListItem = ({ category, index }: { category: Category; index: number }) => {
    const isSelected = selectedCategory?.id === category.id;
    
    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`group flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'bg-blue-50/80 ring-2 ring-blue-500 shadow-lg' 
            : 'bg-white/95 hover:bg-white hover:shadow-lg'
        }`}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleCategoryClick(category)}
      >
        {/* Icon */}
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
            isSelected ? 'scale-110 ring-2 ring-white/50' : 'group-hover:scale-110'
          }`}
          style={{ 
            backgroundColor: category.color ? `${category.color}20` : '#3b82f620',
            color: category.color || '#3b82f6'
          }}
        >
          {category.icon || (
            <div className="text-center">
              <div className="font-bold">
                {category.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
            {category.trending && (
              <Sparkles className="w-4 h-4 text-amber-500" />
            )}
          </div>
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-1">{category.description}</p>
          )}
          {category.expertCount !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Users className="w-3 h-3" />
              <span>{category.expertCount} experts</span>
            </div>
          )}
        </div>

        {/* Selection indicator */}
        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
          isSelected 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 group-hover:border-blue-400'
        }`} />
      </motion.div>
    );
  };

  // Clear selection when search changes
  useEffect(() => {
    if (searchQuery) {
      setSelectedCategory(null);
    }
  }, [searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Search and controls */}
      <div className="space-y-4">
        {/* Mobile search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/95 backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Sort by</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSortBy('name')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'name' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => setSortBy('experts')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'experts' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Most Experts
                </button>
                <button
                  onClick={() => setSortBy('trending')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'trending' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Trending
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Category grid/list */}
      {!isLoading && (
        <>
          {viewMode === 'grid' ? (
            <div className={`grid gap-4 ${
              compact 
                ? 'grid-cols-2 sm:grid-cols-3' 
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}>
              {visibleCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  isSelected={selectedCategory?.id === category.id}
                  onClick={() => handleCategoryClick(category)}
                  compact={compact}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleCategories.map((category, index) => (
                <CategoryListItem key={category.id} category={category} index={index} />
              ))}
            </div>
          )}

          {/* Show more button */}
          {filteredCategories.length > (compact ? 6 : 8) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMore(!showMore)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-5 h-5" />
                  Show Less ({filteredCategories.length - (compact ? 6 : 8)} more)
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5" />
                  Show All ({filteredCategories.length} categories)
                </>
              )}
            </motion.button>
          )}

          {/* Selected category info */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900">
                    Selected: {selectedCategory.name}
                  </h3>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  {selectedCategory.description || `Browsing ${selectedCategory.name} experts`}
                </p>
                <Link
                  href={`/${countryCode}/categories/${selectedCategory.slug}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  View {selectedCategory.name} Experts
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No categories found</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilteredCategories(categories);
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}