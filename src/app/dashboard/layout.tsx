// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdDashboard,
  MdPerson,
  MdCategory,
  MdCalendarToday,
  MdRateReview,
  MdNotifications,
  MdSettings,
  MdPeople,
  MdPhotoLibrary,
  MdPublic,
} from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

const navByRole: Record<string, { name: string; href: string; icon?: React.ReactNode }[]> = {
  ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: <MdDashboard /> },
    { name: "Countries", href: "/dashboard/countries", icon: <MdPublic /> },
    { name: "Users", href: "/dashboard/users", icon: <MdPeople /> },
    { name: "Experts", href: "/dashboard/experts", icon: <MdPerson /> },
    { name: "Categories", href: "/dashboard/categories", icon: <MdCategory /> },
    { name: "Bookings", href: "/dashboard/bookings", icon: <MdCalendarToday /> },
    { name: "Reviews", href: "/dashboard/reviews", icon: <MdRateReview /> },
    { name: "Notifications", href: "/dashboard/notifications", icon: <MdNotifications /> },
    { name: "Media Manager", href: "/dashboard/media", icon: <MdPhotoLibrary /> },
    { name: "Settings", href: "/dashboard/settings", icon: <MdSettings /> },
  ],
  EXPERT: [
    { name: "Dashboard", href: "/dashboard", icon: <MdDashboard /> },
    { name: "Bookings", href: "/dashboard/bookings", icon: <MdCalendarToday /> },
    { name: "Reviews", href: "/dashboard/reviews", icon: <MdRateReview /> },
    { name: "Notifications", href: "/dashboard/notifications", icon: <MdNotifications /> },
  ],
  USER: [
    { name: "Dashboard", href: "/dashboard", icon: <MdDashboard /> },
    { name: "Bookings", href: "/dashboard/bookings", icon: <MdCalendarToday /> },
    { name: "Reviews", href: "/dashboard/reviews", icon: <MdRateReview /> },
    { name: "Notifications", href: "/dashboard/notifications", icon: <MdNotifications /> },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!session || session.authenticated === false)) {
      router.push("/login");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#b84c4c]"></div>
      </div>
    );
  }

  if (!session?.authenticated) {
    return null;
  }

  const role = session.role || "USER";
  const navItems = navByRole[role] || navByRole["USER"];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-800">
          <h1 className="text-lg font-bold">ExpertNear.Me</h1>
          <span className="text-xs mt-1 inline-block px-2 py-1 rounded bg-[#b84c4c] text-white">
            {role}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                pathname === item.href
                  ? "bg-[#b84c4c] text-white"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <button
            onClick={() => logout()}
            className="w-full px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}