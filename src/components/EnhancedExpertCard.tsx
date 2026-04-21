'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Phone, Mail, Clock, CheckCircle, Eye, Heart, MessageCircle, User } from 'lucide-react';

interface Expert {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  categories?: Array<{ id: number; name: string; color?: string }>;
  bio?: string;
  shortDesc?: string;
  verified: boolean;
  available: boolean;
  averageResponseTime?: number;
  distance?: number;
  officeAddress?: string;
  experience?: number;
  languages?: string[];
  hourlyRate?: number;
}

interface EnhancedExpertCardProps {
  expert: Expert;
  countryCode: string;
  compact?: boolean;
  showDistance?: boolean;
  onAction?: (action: string, expertId: number) => void;
}

export default function EnhancedExpertCard({ 
  expert, 
  countryCode, 
  compact = false,
  showDistance = false,
  onAction 
}: EnhancedExpertCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onAction?.('favorite', expert.id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  const formatRate = (rate?: number) => {
    if (!rate) return '';
    return `¥${rate}/hr`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm transition-all duration-300 ${
        compact 
          ? 'bg-white/95 shadow-md hover:shadow-lg border border-gray-100' 
          : 'bg-white/95 hover:shadow-2xl border border-gray-100'
      }`}
      whileHover={{ y: -5 }}
    >
      {/* Status overlay */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        expert.verified 
          ? 'bg-green-500' 
          : 'bg-yellow-500'
      }`} />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-blue-500 to-purple-600 transition-opacity" />

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
                        {renderStars(expert.rating)}
                        <span className="text-xs text-gray-600 ml-1">
                          {expert.rating.toFixed(1)} ({expert.reviewCount})
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
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full truncate"
                        style={{ backgroundColor: cat.color ? `${cat.color}20` : undefined }}
                      >
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
                    onClick={() => onAction?.('message', expert.id)}
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
            {/* Header with avatar and actions */}
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
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center">
                      {renderStars(expert.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {expert.rating.toFixed(1)} ({expert.reviewCount} reviews)
                      </span>
                    </div>
                    
                    {showDistance && expert.distance && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {expert.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>

                  {/* Experience and rate */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {expert.experience && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {expert.experience} years exp.
                      </div>
                    )}
                    {expert.hourlyRate && (
                      <div className="font-semibold text-gray-900">
                        {formatRate(expert.hourlyRate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFavorite}
                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`} 
                    />
                  </button>
                  
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category tags */}
            {expert.categories && expert.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {expert.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center gap-1"
                    style={{ 
                      backgroundColor: cat.color ? `${cat.color}20` : '#dbeafe',
                      color: cat.color || '#3b82f6'
                    }}
                  >
                    {cat.icon && <span className="text-sm">{cat.icon}</span>}
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {expert.bio || expert.shortDesc || 'Professional expert with excellent track record and customer satisfaction.'}
              </p>
            </div>

            {/* Detailed info (expandable) */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t pt-4 space-y-3">
                    {/* Languages */}
                    {expert.languages && expert.languages.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">Languages</h4>
                        <div className="flex flex-wrap gap-1">
                          {expert.languages.map((lang, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Office address */}
                    {expert.officeAddress && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Office Address
                        </h4>
                        <p className="text-sm text-gray-600">{expert.officeAddress}</p>
                      </div>
                    )}

                    {/* Average response time */}
                    {expert.averageResponseTime && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Average Response Time
                        </h4>
                        <p className="text-sm text-gray-600">{expert.averageResponseTime} hours</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <Link
                href={`/${countryCode}/experts/${expert.id}`}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Profile
              </Link>
              
              {expert.phone && (
                <a
                  href={`tel:${expert.phone}`}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
              
              <button
                onClick={() => onAction?.('message', expert.id)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
              
              <button
                onClick={() => onAction?.('book', expert.id)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}