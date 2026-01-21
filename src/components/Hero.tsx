// File: src/components/Hero.tsx

import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="relative -mt-20 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center text-white px-6 py-24">
      {/* Dark merun glass overlay */}
      <div className="max-w-4xl mx-auto text-center rounded-2xl backdrop-blur-xl bg-[#7a1f1f]/70 border border-white/10 px-8 py-10 shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Find Trusted Experts Near You</h1>
        <p className="text-base md:text-lg leading-relaxed text-white/90 mb-8">
          Discover verified professionals across IT, Legal, Health, MEP and more — tailored for expats in the Middle East and Southeast Asia.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* Glass button: Browse Categories */}
          <Link
            href="/categories"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white bg-white/10 border border-white/20 backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Browse Categories
          </Link>

          {/* Glass button: Add Expert */}
          <Link
            href="/create-expert-account"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white bg-white/10 border border-white/20 backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Create Exper Account
          </Link>
        </div>
      </div>

      {/* Subtle top-to-bottom vignette to deepen the hero */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
    </section>
  );
}
