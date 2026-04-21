'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Grid, List, Search } from 'lucide-react';

interface Category {
  id: number | string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  expertCount?: number;
  slug: string;
}

interface CategoryGridProps {
  categories: Category[];
  countryCode: string;
  onCategorySelect?: (category: Category) => void;
  compact?: boolean;
}

export default function EnhancedCategoryGrid({ 
  categories, 
  countryCode, 
  onCategorySelect,
  compact = false 
}: CategoryGridProps) {
  const [showMore, setShowMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  
  const visibleCategories = showMore ? filteredCategories : filteredCategories.slice(0, compact ? 8 : 12);
  const isExpanded = showMore || filteredCategories.length <= (compact ? 8 : 12);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
      if (!showMore && filtered.length > (compact ? 8 : 12)) {
        setShowMore(true);
      }
    }
  }, [searchQuery, categories, showMore, compact]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
    onCategorySelect?.(category);
  };

  const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
    const isSelected = selectedCategory?.id === category.id;
    
    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group relative overflow-hidden rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50/80 shadow-lg transform scale-105' 
            : 'bg-white/90 hover:bg-white hover:shadow-xl hover:scale-105'
        }`}
        onClick={() => handleCategoryClick(category)}
      >
        {/* Enhanced background gradient */}
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

          {/* Expert count */}
          {category.expertCount !== undefined && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{category.expertCount} {category.expertCount === 1 ? 'Expert' : 'Experts'}</span>
            </div>
          )}

          {/* Interactive elements */}
          <div className="flex items-center justify-between">
            {/* View button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isSelected ? 'Selected' : 'View'}
            </motion.button>

            {/* Chevron for selection state */}
            <motion.div
              animate={{ rotate: isSelected ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>

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
  };

  const CategoryListItem = ({ category, index }: { category: Category; index: number }) => {
    const isSelected = selectedCategory?.id === category.id;
    
    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`group flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'bg-blue-50/80 ring-2 ring-blue-500 shadow-lg' 
            : 'bg-white/90 hover:bg-white hover:shadow-lg'
        }`}
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
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-1">{category.description}</p>
          )}
        </div>

        {/* Expert count */}
        {category.expertCount !== undefined && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{category.expertCount}</span>
          </div>
        )}

        {/* Selection indicator */}
        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
          isSelected 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 group-hover:border-blue-400'
        }`} />
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      {/* Search and view controls (desktop) */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {compact && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Category grid/list */}
      {viewMode === 'grid' ? (
        <div className={`grid gap-4 ${
          compact 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {visibleCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
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
      {filteredCategories.length > (compact ? 8 : 12) && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMore(!showMore)}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Show Less ({filteredCategories.length - (compact ? 8 : 12)} more)
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
            className="mt-6 p-4 bg-blue-50/80 rounded-xl border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Selected: {selectedCategory.name}
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedCategory.description || `Browsing ${selectedCategory.name} experts`}
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
            <Link
              href={`/${countryCode}/categories/${selectedCategory.slug}`}
              className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    </div>
  );
}