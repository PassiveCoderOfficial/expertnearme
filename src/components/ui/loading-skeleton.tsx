'use client';

import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero loading skeleton */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl h-64 md:h-80 lg:h-96 animate-pulse"></div>
      
      {/* Category card skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-md"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </motion.div>
        ))}
      </div>
      
      {/* Expert card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}