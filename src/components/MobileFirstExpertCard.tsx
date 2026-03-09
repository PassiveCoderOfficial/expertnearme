'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, MapPin, StarIcon, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Expert {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  categories: Array<{ id: string; name: string; icon?: string; color?: string }>;
  responseTime?: string;
  shortDesc?: string;
  phone?: string;
  isPremium?: boolean;
  isOnline?: boolean;
  verified?: boolean;
  available?: boolean;
}

interface MobileFirstExpertCardProps {
  expert: Expert;
  compact?: boolean;
  showDistance?: boolean;
  countryCode?: string;
}

export default function MobileFirstExpertCard({
  expert,
  compact = true,
  showDistance = true,
  countryCode = 'bd'
}: MobileFirstExpertCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleAction = (action: 'view' | 'message') => {
    if (action === 'view') {
      // Navigate to expert detail page
      window.location.href = `/${countryCode}/experts/${expert.id}`;
    } else if (action === 'message') {
      // Open messaging interface
      console.log('Opening message interface for:', expert.name);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getResponseTimeColor = () => {
    if (!expert.responseTime) return 'bg-gray-100 text-gray-600';
    if (expert.responseTime.includes('min') && parseInt(expert.responseTime) < 30) {
      return 'bg-green-100 text-green-700';
    } else if (expert.responseTime.includes('hour') || parseInt(expert.responseTime) >= 60) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  const getResponseTimeText = () => {
    return expert.responseTime || 'N/A';
  };

  const iconMap: Record<string, JSX.Element> = {
    'Technology': <StarIcon className="w-4 h-4" />,
    'Health': <StarIcon className="w-4 h-4" />,
    'Transport': <StarIcon className="w-4 h-4" />,
    'Home': <StarIcon className="w-4 h-4" />,
    'Business': <StarIcon className="w-4 h-4" />,
    'Education': <StarIcon className="w-4 h-4" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm transition-all duration-300 ${
        compact 
          ? 'bg-white/95 shadow-lg border border-gray-100 hover:shadow-xl' 
          : 'bg-white/95 hover:shadow-2xl border border-gray-100'
      }`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      {/* Status overlay */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        expert.verified 
          ? 'bg-green-500' 
          : 'bg-yellow-500'
      }`} />
      
      {/* Premium badge */}
      {expert.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <StarIcon className="w-3 h-3" />
            Premium
          </div>
        </div>
      )}
      
      {/* Online indicator */}
      {expert.isOnline && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white"></div>
        </div>
      )}

      <div className="relative">
        {/* Compact mode */}
        {compact ? (
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {expert.avatar ? (
                    <img 
                      src={expert.avatar} 
                      alt={expert.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    expert.name.charAt(0).toUpperCase()
                  )}
                </div>
                {expert.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                {!expert.available && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {expert.name}
                      {!expert.available && (
                        <span className="ml-2 text-xs text-gray-500">(Unavailable)</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(expert.rating || 0)}
                        <span className="text-xs text-gray-600 ml-1">
                          {(expert.rating || 0).toFixed(1)} ({expert.reviewCount || 0})
                        </span>
                      </div>
                      {showDistance && expert.distance && (
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {expert.distance.toFixed(1)}km
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Favorite button */}
                  <button
                    onClick={handleFavorite}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`} 
                    />
                  </button>
                </div>

                {/* Category tags */}
                {expert.categories && expert.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {expert.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full truncate flex items-center gap-1"
                        style={{ backgroundColor: cat.color ? `${cat.color}20` : undefined }}
                      >
                        {cat.icon && <span className="text-xs">{cat.icon}</span>}
                        {cat.name}
                      </span>
                    ))}
                    {expert.categories.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{expert.categories.length - 1}
                      </span>
                    )}
                  </div>
                )}

                {/* Short description */}
                {expert.shortDesc && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {expert.shortDesc}
                  </p>
                )}

                {/* Quick actions */}
                <div className="flex gap-1 mt-3">
                  <Link
                    href={`/${countryCode}/experts/${expert.id}`}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors text-center"
                  >
                    View
                  </Link>
                  {expert.phone && (
                    <a
                      href={`tel:${expert.phone}`}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      📞
                    </a>
                  )}
                  <button
                    onClick={() => handleAction('message')}
                    className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    💬
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {expert.avatar ? (
                      <img 
                        src={expert.avatar} 
                        alt={expert.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      expert.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {expert.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!expert.available && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Basic info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {expert.name}
                    </h2>
                    {expert.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {expert.isOnline && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Online
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center">
                      {renderStars(expert.rating || 0)}
                      <span className="text-sm text-gray-600 ml-1">
                        {(expert.rating || 0).toFixed(1)} ({expert.reviewCount || 0} reviews)
                      </span>
                    </div>
                    {showDistance && expert.distance && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {expert.distance.toFixed(1)}km
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Favorite button */}
              <button
                onClick={handleFavorite}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Heart 
                  className={`w-5 h-5 ${
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`} 
                />
              </button>
            </div>

            {/* Categories */}
            {expert.categories && expert.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {expert.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center gap-1"
                    style={{ backgroundColor: cat.color ? `${cat.color}20` : undefined }}
                  >
                    {cat.icon && <span className="text-sm">{cat.icon}</span>}
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 mb-6">
              {expert.shortDesc || 'Professional expert ready to help you with your needs.'}
            </p>

            {/* Response time */}
            {expert.responseTime && (
              <div className="mb-4">
                <div className={`text-sm px-3 py-2 rounded-lg inline-flex items-center gap-2 ${getResponseTimeColor()}`}>
                  <Clock className="w-4 h-4" />
                  Response time: {getResponseTimeText()}
                </div>
              </div>
            )}

            {/* Contact buttons */}
            <div className="flex gap-3">
              <Link
                href={`/${countryCode}/experts/${expert.id}`}
                className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                View Profile
              </Link>
              {expert.phone && (
                <a
                  href={`tel:${expert.phone}`}
                  className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  📞 Call
                </a>
              )}
              <button
                onClick={() => handleAction('message')}
                className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                💬 Message
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}