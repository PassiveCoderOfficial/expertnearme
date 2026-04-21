"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdDashboard, MdPerson, MdCategory, MdCalendarToday, MdRateReview,
  MdNotifications, MdSettings, MdPeople, MdPhotoLibrary, MdPublic,
  MdCurrencyExchange, MdEdit, MdMenu, MdClose, MdLogout,
} from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/Logo";

const navByRole: Record<string, { name: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { name: "Dashboard",      href: "/dashboard",                icon: <MdDashboard /> },
    { name: "Countries",      href: "/dashboard/countries",      icon: <MdPublic /> },
    { name: "Users",          href: "/dashboard/users",          icon: <MdPeople /> },
    { name: "Experts",        href: "/dashboard/experts",        icon: <MdPerson /> },
    { name: "Categories",     href: "/dashboard/categories",     icon: <MdCategory /> },
    { name: "Pricing",        href: "/dashboard/pricing",        icon: <MdCurrencyExchange /> },
    { name: "Bookings",       href: "/dashboard/bookings",       icon: <MdCalendarToday /> },
    { name: "Reviews",        href: "/dashboard/reviews",        icon: <MdRateReview /> },
    { name: "Notifications",  href: "/dashboard/notifications",  icon: <MdNotifications /> },
    { name: "Media",          href: "/dashboard/media",          icon: <MdPhotoLibrary /> },
    { name: "Settings",       href: "/dashboard/settings",       icon: <MdSettings /> },
  ],
  EXPERT: [
    { name: "Dashboard",      href: "/dashboard",                icon: <MdDashboard /> },
    { name: "My Profile",     href: "/dashboard/profile",        icon: <MdEdit /> },
    { name: "Bookings",       href: "/dashboard/bookings",       icon: <MdCalendarToday /> },
    { name: "Reviews",        href: "/dashboard/reviews",        icon: <MdRateReview /> },
    { name: "Notifications",  href: "/dashboard/notifications",  icon: <MdNotifications /> },
  ],
  USER: [
    { name: "Dashboard",      href: "/dashboard",                icon: <MdDashboard /> },
    { name: "Bookings",       href: "/dashboard/bookings",       icon: <MdCalendarToday /> },
    { name: "Reviews",        href: "/dashboard/reviews",        icon: <MdRateReview /> },
    { name: "Notifications",  href: "/dashboard/notifications",  icon: <MdNotifications /> },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!session || !session.authenticated)) router.push("/login");
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.authenticated) return null;

  const role = session.role || "USER";
  const navItems = navByRole[role] || navByRole["USER"];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? "w-full" : "w-64 hidden md:flex"} flex-col bg-slate-950 border-r border-white/8 min-h-screen`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="text-sm font-bold text-white tracking-tight">
            ExpertNear<span className="text-orange-400">.Me</span>
          </span>
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
            <MdClose size={22} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-white/5">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          role === "ADMIN" ? "bg-purple-500/20 text-purple-300 border border-purple-500/25" :
          role === "EXPERT" ? "bg-orange-500/20 text-orange-300 border border-orange-500/25" :
          "bg-slate-700 text-slate-300"
        }`}>
          {role}
        </span>
        <p className="text-xs text-slate-500 mt-1 truncate">{session.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`text-lg ${active ? "text-orange-400" : "text-slate-500"}`}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <MdLogout className="text-lg text-slate-500" />
          Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full bg-slate-950">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-slate-950 border-b border-white/8">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <MdMenu size={24} />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-sm font-bold text-white">ExpertNear<span className="text-orange-400">.Me</span></span>
          </Link>
          <div className="w-6" />
        </div>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
