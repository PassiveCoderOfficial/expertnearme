'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Star, Users, Clock, Search, Menu, X, Wifi, Shield, TrendingUp } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface HeroProps {
  onScrollTo?: (section: string) => void;
}

interface BenefitCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}



export default function MobileFirstHero({ onScrollTo }: HeroProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  
  const benefits: BenefitCard[] = [
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for 3G/4G networks with instant loading",
      accent: "from-green-500 to-emerald-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Verified",
      description: "Every expert manually verified and background checked",
      accent: "from-blue-500 to-cyan-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Matching",
      description: "AI-powered recommendations based on your needs",
      accent: "from-purple-500 to-indigo-600"
    }
  ];

  

  // Performance optimization: Use useCallback for event handlers
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 30);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-cycle benefits for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  // Handle search with debounced input
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      // Future: Implement search navigation
      console.log('Searching for:', value);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setIsMenuOpen(false);
    }
  };

  

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      

      {/* Performance-optimized background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Simplified background pattern for better performance */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogIDxwYXRoIGQ9Ik0yMCAyMGMwLTUgLjUtMTAgMTAtMTAgMTBzMTAtMSAxMC0xMCAxMCAxMCAxMC0xMCAxMC0xMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPgogIDwvcmVjdD4KPC9zdmc+')]"></div>
        
        {/* Mobile-optimized floating elements */}
        <motion.div 
          className="absolute top-20 left-10 w-16 h-16 bg-blue-500/20 rounded-full blur-xl"
          animate={{ 
            x: [0, 20, 0], 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Mobile Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <motion.div 
          className={`backdrop-blur-md border-b ${isScrolled ? 'bg-white/10 border-white/20' : 'bg-transparent'}`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EN</span>
                </div>
                <span className="text-white font-semibold hidden sm:block">ExpertNear</span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 space-y-2">
                    <Link 
                      href="/search" 
                      className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Search Experts
                    </Link>
                    <Link 
                      href="/create-expert-account" 
                      className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join as Expert
                    </Link>
                    <button 
                      onClick={() => scrollToSection('features')}
                      className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full text-left"
                    >
                      Explore Features
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          {/* Left column - Hero content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Trust indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">Rated 4.8 by users</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                Find Trusted Experts
                <span className="block text-blue-200 mt-2">Near You Instantly</span>
              </h1>
            </motion.div>

            {/* Enhanced Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Discover verified professionals across IT, Legal, Health, MEP and more — 
              <span className="block sm:inline">tailored for expats in the Middle East and Southeast Asia.</span>
            </motion.p>

            {/* Mobile-first CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
            >
              {/* Primary CTA */}
              <Link
                href="/search"
                className="group inline-flex items-center justify-center rounded-lg px-8 py-4 text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50 relative overflow-hidden"
              >
                <span className="text-lg font-medium relative z-10">Search Experts</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-blue-100 border-2 border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <span className="text-lg font-medium">How It Works</span>
              </Link>
            </motion.div>

            {/* Mobile benefit showcase */}
            <div className="lg:hidden">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {benefits[currentBenefit].icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {benefits[currentBenefit].title}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {benefits[currentBenefit].description}
                  </p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {benefits.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBenefit(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentBenefit ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right column - Desktop benefits */}
          <div className="hidden lg:block space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className={`bg-gradient-to-r ${benefit.accent}/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${benefit.accent} rounded-xl flex items-center justify-center`}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">1K+</div>
            <div className="text-xs text-blue-200">Experts</div>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">10+</div>
            <div className="text-xs text-blue-200">Countries</div>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-xs text-blue-200">Support</div>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">4.8⭐</div>
            <div className="text-xs text-blue-200">Rating</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <button
          onClick={() => scrollToSection('features')}
          className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors group"
        >
          <ChevronDown className="w-6 h-6 text-white group-hover:translate-y-1 transform transition-transform" />
        </button>
      </motion.div>

      {/* Performance-optimized bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />

      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}