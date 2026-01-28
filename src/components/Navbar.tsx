// File: src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setLogo(data.logo))
      .catch(() => setLogo(null));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-0 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0">
          {logo ? (
            <img src={logo} alt="Site Logo" className="h-18 w-auto" />
          ) : (
            <span className="text-xl font-bold text-[#b84c4c] tracking-tight">
              ExpertNear.Me
            </span>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/">Home</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/create-expert-account">Create Expert Account</Link>
          <Link href="/manage-category">Manage Categories</Link>
        </nav>

        {/* Search Bar */}
        <div className="w-64 hidden md:block">
          <SearchBar />
        </div>

        {/* Auth Links */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
        </div>
      </div>
    </header>
  );
}
