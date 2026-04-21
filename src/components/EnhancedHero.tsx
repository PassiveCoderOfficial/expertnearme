'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Star, Users, Clock } from 'lucide-react';

interface HeroProps {
  onScrollTo?: (section: string) => void;
}

export default function EnhancedHero({ onScrollTo }: HeroProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const benefits = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Verified Experts",
      description: "All professionals are thoroughly verified and vetted"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Get help anytime with our dedicated support team"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "5-Star Rated",
      description: "Join thousands of satisfied customers"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Local Experts",
      description: "Find trusted professionals in your area"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const autoSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % benefits.length);
  };

  useEffect(() => {
    const interval = setInterval(autoSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative -mt-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white min-h-[90vh] flex items-center overflow-hidden">
      {/* Premium background with enhanced visuals */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Enhanced animated background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Enhanced floating elements with animation */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-indigo-400/20 rounded-full blur-lg animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-md animate-pulse animation-delay-3000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column - Hero content */}
          <div className="text-center lg:text-left">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Trusted by 10,000+ users</span>
            </div>

            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                Find Trusted Experts
                <span className="block text-blue-200">Near You Instantly</span>
              </h1>
            </div>

            {/* Enhanced Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed px-4">
              Discover verified professionals across IT, Legal, Health, MEP and more —
              <span className="block sm:inline">tailored for expats in the Middle East and Southeast Asia.</span>
            </p>

            {/* Mobile-first CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 mb-8">
              {/* Primary CTA */}
              <Link
                href="/search"
                className="group inline-flex items-center justify-center rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-white bg-white/90 hover:bg-white/95 backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50 relative overflow-hidden"
              >
                <span className="text-base sm:text-lg font-medium relative z-10">Search Experts</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
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

            {/* Enhanced Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0 px-4">
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-xs text-blue-200">Verified Experts</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-xs text-blue-200">Categories</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-xs text-blue-200">Support</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">4.8⭐</div>
                <div className="text-xs text-blue-200">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right column - Mobile-optimized benefits carousel */}
          <div className="lg:hidden">
            <div className="relative h-64 bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="overflow-hidden rounded-xl">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 p-6 transition-all duration-500 ease-in-out ${
                      index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 bg-white/20 rounded-full p-3 backdrop-blur-sm">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-blue-100 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {benefits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop benefits grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-blue-100 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button
          onClick={() => onScrollTo?.('find')}
          className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom overlay for text contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/90 to-transparent pointer-events-none"></div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .animation-delay-3000 {
          animation-delay: 3000ms;
        }
      `}</style>
    </section>
  );
}