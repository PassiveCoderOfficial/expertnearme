// src/app/dashboard/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdDashboard,
  MdPerson,
  MdCategory,
  MdCalendarToday,
  MdRateReview,
  MdNotifications,
  MdSettings,
  MdPeople,
  MdPhotoLibrary, // 👈 new icon for Media Manager
} from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

const navByRole: Record<string, { name: string; href: string; icon?: React.ReactNode }[]> = {
  ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: <MdDashboard /> },
    { name: "Users", href: "/dashboard/users", icon: <MdPeople /> },
    { name: "Experts", href: "/dashboard/experts", icon: <MdPerson /> },
    { name: "Categories", href: "/dashboard/categories", icon: <MdCategory /> },
    { name: "Bookings", href: "/dashboard/bookings", icon: <MdCalendarToday /> },
    { name: "Reviews", href: "/dashboard/reviews", icon: <MdRateReview /> },
    { name: "Notifications", href: "/dashboard/notifications", icon: <MdNotifications /> },

    // 👇 new Media Manager entry
    { name: "Media Manager", href: "/dashboard/media", icon: <MdPhotoLibrary /> },

    // Settings stays here for logo/favicon and other admin configs
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
  const [darkMode, setDarkMode] = useState(true);

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
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-gray-900 min-h-screen"}>
      <header
        className={`flex items-center justify-between px-6 py-3 border-b ${
          darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"
        }`}
      >
        <h1 className="text-lg font-bold">ExpertNear.Me Dashboard</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm px-3 py-1 rounded bg-[#b84c4c] text-white">{role}</span>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={() => logout()}
            className="px-3 py-2 rounded border border-gray-600 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`w-64 border-r ${
            darkMode ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"
          } p-4`}
        >
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded ${
                  pathname === item.href
                    ? "bg-[#b84c4c] text-white"
                    : darkMode
                    ? "hover:bg-gray-700 hover:text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
