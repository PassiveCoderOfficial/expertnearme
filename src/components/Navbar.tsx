"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [logo, setLogo] = useState<string | null>(null);
  const { session, logout } = useAuth();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setLogo(data.logo))
      .catch(() => setLogo(null));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-0 flex items-center justify-between">
        {/* Logo with fixed height */}
        <Link href="/" className="flex items-center gap-2 h-16">
          {logo ? (
            <img src={logo} alt="Site Logo" className="h-16 w-auto" />
          ) : (
            <span className="text-xl font-bold text-[#b84c4c] tracking-tight">
              ExpertNear.Me
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/">Home</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/create-expert-account">Create Expert Account</Link>
          <Link href="/manage-category">Manage Categories</Link>
        </nav>

        {/* Desktop Search + Auth */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-64">
            <SearchBar />
          </div>
          {session?.authenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-700 hover:text-[#b84c4c]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700">
                Login
              </Link>
              <Link href="/signup" className="text-sm font-medium text-gray-700">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
