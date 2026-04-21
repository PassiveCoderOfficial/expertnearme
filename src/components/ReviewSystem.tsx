'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Flag,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  SortAsc,
  SortDesc,
  Plus
} from 'lucide-react';

interface Review {
  id: number;
  providerId: number;
  clientId: number;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  response?: {
    providerName: string;
    comment: string;
    date: string;
  };
  service?: string;
  bookingId?: number;
  verified: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: Review[];
  pendingReviews: number;
}

interface ReviewSystemProps {
  providerId?: number;
  clientId?: number;
  onReviewSubmit?: (review: Omit<Review, 'id' | 'status' | 'helpfulCount'>) => void;
  onReviewModerate?: (reviewId: number, action: 'approve' | 'reject') => void;
  showModerationPanel?: boolean;
}

export default function ReviewSystem({ 
  providerId,
  clientId,
  onReviewSubmit,
  onReviewModerate,
  showModerationPanel = false
}: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    service: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: 1,
        providerId: 1,
        clientId: 101,
        clientName: 'John Smith',
        rating: 5,
        comment: 'Excellent service! Very professional and completed the work on time. Highly recommend!',
        date: '2024-01-15',
        status: 'approved',
        helpfulCount: 12,
        service: 'Web Development',
        verified: true
      },
      {
        id: 2,
        providerId: 1,
        clientId: 102,
        clientName: 'Sarah Johnson',
        rating: 4,
        comment: 'Good quality work but took a bit longer than expected. Overall satisfied with the result.',
        date: '2024-01-12',
        status: 'approved',
        helpfulCount: 8,
        service: 'Graphic Design',
        verified: true
      },
      {
        id: 3,
        providerId: 1,
        clientId: 103,
        clientName: 'Mike Wilson',
        rating: 3,
        comment: 'The service was okay, but communication could be better. Work was completed as required.',
        date: '2024-01-10',
        status: 'approved',
        helpfulCount: 5,
        service: 'Digital Marketing',
        verified: true
      },
      {
        id: 4,
        providerId: 1,
        clientId: 104,
        clientName: 'Emma Davis',
        rating: 5,
        comment: 'Outstanding service! Very detailed and professional. Will definitely use again.',
        date: '2024-01-08',
        status: 'pending',
        helpfulCount: 0,
        service: 'SEO Consulting',
        verified: true
      },
      {
        id: 5,
        providerId: 1,
        clientId: 105,
        clientName: 'Robert Brown',
        rating: 2,
        comment: 'Not satisfied with the quality of work. Expected better attention to detail.',
        date: '2024-01-05',
        status: 'approved',
        helpfulCount: 3,
        service: 'Content Writing',
        verified: false
      }
    ];

    setReviews(mockReviews);

    // Calculate stats
    const totalReviews = mockReviews.length;
    const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: mockReviews.filter(r => r.rating === rating).length,
      percentage: (mockReviews.filter(r => r.rating === rating).length / totalReviews) * 100
    }));

    const recentReviews = mockReviews.filter(r => r.status === 'approved').slice(0, 3);
    const pendingReviews = mockReviews.filter(r => r.status === 'pending').length;

    setStats({
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      ratingDistribution,
      recentReviews,
      pendingReviews
    });
  }, []);

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      if (filter !== 'all' && review.status !== filter) return false;
      if (selectedRating && review.rating !== selectedRating) return false;
      if (searchQuery && !review.comment.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !review.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  // Submit review
  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment.trim()) return;

    setIsSubmitting(true);
    
    const reviewData: Omit<Review, 'id' | 'status' | 'helpfulCount'> = {
      providerId: providerId || 1,
      clientId: clientId || 1,
      clientName: 'Current User',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      service: newReview.service,
      verified: true
    };

    // Simulate API call
    setTimeout(() => {
      const newReviewObj: Review = {
        ...reviewData,
        id: reviews.length + 1,
        status: 'pending',
        helpfulCount: 0
      };
      
      setReviews([newReviewObj, ...reviews]);
      setNewReview({ rating: 0, comment: '', service: '' });
      setShowReviewForm(false);
      setIsSubmitting(false);
      
      onReviewSubmit?.(reviewData);
    }, 1000);
  };

  // Moderate review
  const handleModerateReview = (reviewId: number, action: 'approve' | 'reject') => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, status: action === 'approve' ? 'approved' : 'rejected' }
        : review
    ));
    onReviewModerate?.(reviewId, action);
  };

  // Mark review as helpful
  const markAsHelpful = (reviewId: number) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpfulCount: review.helpfulCount + 1 }
        : review
    ));
  };

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizeClasses = {
      small: 'w-3 h-3',
      medium: 'w-4 h-4',
      large: 'w-5 h-5'
    };
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : rating > i && rating < i + 1
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {review.clientName.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(review.rating, 'small')}
              <span className="text-sm text-gray-600">
                {new Date(review.date).toLocaleDateString()}
              </span>
              {review.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.status === 'pending' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              Pending
            </span>
          )}
        </div>
      </div>

      {review.service && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">
            Service: <span className="font-medium text-gray-900">{review.service}</span>
          </span>
        </div>
      )}

      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => markAsHelpful(review.id)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful ({review.helpfulCount})
        </button>

        {/* Provider response */}
        {review.response && (
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                P
              </div>
              <span className="font-medium text-gray-900">{review.response.providerName}</span>
              <span className="text-xs text-gray-500">
                {new Date(review.response.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{review.response.comment}</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (showModerationPanel) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Moderation</h1>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                {renderStars(stats.averageRating, 'large')}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentReviews.length}</p>
                  <p className="text-sm text-gray-600">Recent Reviews</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {stats.ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-16">
                    <span className="text-sm font-medium">{item.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Pending Reviews */}
        {filter === 'pending' && (stats?.pendingReviews ?? 0) > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Pending Reviews ({stats?.pendingReviews ?? 0})
            </h3>
            <div className="grid gap-4">
              {reviews.filter(r => r.status === 'pending').map((review) => (
                <div key={review.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <ReviewCard review={review} />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleModerateReview(review.id, 'approve')}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerateReview(review.id, 'reject')}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Reviews */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Reviews ({filteredReviews.length})
          </h3>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Regular review display for clients/providers
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviews & Ratings</h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
              {renderStars(stats.averageRating, 'large')}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.ratingDistribution[4]?.count || 0}</p>
                <p className="text-sm text-gray-600">5 Star Reviews</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      <button
        onClick={() => setShowReviewForm(true)}
        className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Write a Review
      </button>

      {/* Write Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition-colors ${
                        star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className={star <= newReview.rating ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <input
                  type="text"
                  value={newReview.service}
                  onChange={(e) => setNewReview(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Web Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !newReview.rating || !newReview.comment.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
