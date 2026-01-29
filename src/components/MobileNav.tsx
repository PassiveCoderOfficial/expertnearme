// File: src/components/MobileNav.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { session, logout } = useAuth();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative z-20">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-[#b84c4c] text-white shadow hover:bg-[#a03c3c] focus:outline-none focus:ring-2 focus:ring-[#b84c4c]/40"
      >
        Menu
        <span className="sr-only">Toggle mobile navigation</span>
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30"
        />
      )}

      <div
        id="mobile-nav-panel"
        className={`transition transform fixed top-16 left-0 right-0 mx-4 z-50 rounded-xl bg-white shadow-2xl border border-gray-200 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="p-4 grid gap-2 text-sm font-medium text-gray-700">
          <Link href="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
            Home
          </Link>
          <Link href="/categories" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
            Categories
          </Link>
          <Link href="/create-expert-account" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
            Create Expert Account
          </Link>
          <Link href="/experts/manage" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
            Expert Management
          </Link>

          {session?.authenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="text-left rounded-md px-3 py-2 hover:bg-gray-100"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
                Login
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-gray-100">
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
