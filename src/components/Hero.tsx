// src/components/Hero.tsx

import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="relative -mt-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white min-h-[80vh] flex items-center">
      {/* Mobile-first Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 w-full">
        <div className="text-center">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              Find Trusted Experts
              <span className="block text-blue-200">Near You</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed px-4">
            Discover verified professionals across IT, Legal, Health, MEP and more — 
            <span className="block sm:inline">tailored for expats in the Middle East and Southeast Asia.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            {/* Primary CTA */}
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-white bg-white/90 hover:bg-white/90/95 backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <span className="text-base sm:text-lg font-medium">Search Experts</span>
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/categories"
              className="inline-flex items-center justify-center rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-blue-100 border-2 border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <span className="text-base sm:text-lg font-medium">Browse Categories</span>
            </Link>

            {/* Tertiary CTA */}
            <Link
              href="/create-expert-account"
              className="inline-flex items-center justify-center rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-blue-100 border-2 border-blue-300/30 hover:bg-blue-400/20 hover:border-blue-400/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <span className="text-base sm:text-lg font-medium">Join as Expert</span>
            </Link>
          </div>

          {/* Stats/Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-sm text-blue-200">Verified Experts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-blue-200">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-blue-200">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">4.8⭐</div>
              <div className="text-sm text-blue-200">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] [background-size:60px_60px]"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-400/20 rounded-full blur-lg animate-pulse animation-delay-1000"></div>
      </div>

      {/* Bottom overlay for text contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/80 to-transparent pointer-events-none"></div>
    </section>
  );
}
