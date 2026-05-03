// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdDashboard, MdPerson, MdCategory, MdCalendarToday, MdRateReview,
  MdNotifications, MdSettings, MdPeople, MdPhotoLibrary, MdPublic,
  MdCurrencyExchange, MdEdit, MdClose, MdLogout,
  MdStar, MdMap, MdPayment, MdAdminPanelSettings, MdBarChart,
  MdFavorite, MdSearch, MdCampaign, MdSupportAgent, MdMessage, MdAccessTime,
  MdArticle, MdHandshake,
} from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

type NavItem = { name: string; href: string; icon: React.ReactNode };

const ADMIN_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Countries",      href: "/dashboard/countries",           icon: <MdPublic /> },
  { name: "Users",          href: "/dashboard/users",               icon: <MdPeople /> },
  { name: "Staff & Roles",  href: "/dashboard/staff",               icon: <MdAdminPanelSettings /> },
  { name: "Experts",        href: "/dashboard/experts",             icon: <MdPerson /> },
  { name: "Featured",       href: "/dashboard/featured",            icon: <MdStar /> },
  { name: "Categories",     href: "/dashboard/categories",          icon: <MdCategory /> },
  { name: "Subscriptions",  href: "/dashboard/subscriptions",       icon: <MdCurrencyExchange /> },
  { name: "Pricing",        href: "/dashboard/pricing",             icon: <MdBarChart /> },
  { name: "Payment Config", href: "/dashboard/payment-config",      icon: <MdPayment /> },
  { name: "Bookings",       href: "/dashboard/bookings",            icon: <MdCalendarToday /> },
  { name: "Messages",       href: "/dashboard/messages",            icon: <MdMessage /> },
  { name: "Reviews",        href: "/dashboard/reviews",             icon: <MdRateReview /> },
  { name: "Blog",           href: "/dashboard/blog",                icon: <MdArticle /> },
  { name: "Agents",         href: "/dashboard/agents",              icon: <MdHandshake /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdNotifications /> },
  { name: "Media",          href: "/dashboard/media",               icon: <MdPhotoLibrary /> },
  { name: "Settings",       href: "/dashboard/settings",            icon: <MdSettings /> },
];

const MANAGER_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Experts",        href: "/dashboard/experts",             icon: <MdPerson /> },
  { name: "Featured",       href: "/dashboard/featured",            icon: <MdStar /> },
  { name: "Categories",     href: "/dashboard/categories",          icon: <MdCategory /> },
  { name: "Subscriptions",  href: "/dashboard/subscriptions",       icon: <MdCurrencyExchange /> },
  { name: "Bookings",       href: "/dashboard/bookings",            icon: <MdCalendarToday /> },
  { name: "Messages",       href: "/dashboard/messages",            icon: <MdMessage /> },
  { name: "Reviews",        href: "/dashboard/reviews",             icon: <MdRateReview /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdNotifications /> },
];

const MARKETER_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Featured",       href: "/dashboard/featured",            icon: <MdStar /> },
  { name: "Categories",     href: "/dashboard/categories",          icon: <MdCategory /> },
  { name: "Pricing",        href: "/dashboard/pricing",             icon: <MdBarChart /> },
  { name: "Blog",           href: "/dashboard/blog",                icon: <MdArticle /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdCampaign /> },
  { name: "Media",          href: "/dashboard/media",               icon: <MdPhotoLibrary /> },
];

const SEO_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Experts",        href: "/dashboard/experts",             icon: <MdPerson /> },
  { name: "Categories",     href: "/dashboard/categories",          icon: <MdCategory /> },
  { name: "Blog",           href: "/dashboard/blog",                icon: <MdArticle /> },
  { name: "Settings",       href: "/dashboard/settings",            icon: <MdSettings /> },
];

const SALES_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Experts",        href: "/dashboard/experts",             icon: <MdPerson /> },
  { name: "Subscriptions",  href: "/dashboard/subscriptions",       icon: <MdCurrencyExchange /> },
  { name: "Bookings",       href: "/dashboard/bookings",            icon: <MdCalendarToday /> },
  { name: "Messages",       href: "/dashboard/messages",            icon: <MdMessage /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdSupportAgent /> },
];

const EXPERT_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "My Profile",     href: "/dashboard/profile",             icon: <MdEdit /> },
  { name: "My Plan",        href: "/dashboard/my-subscription",     icon: <MdCurrencyExchange /> },
  { name: "Availability",   href: "/dashboard/availability",        icon: <MdAccessTime /> },
  { name: "Bookings",       href: "/dashboard/bookings",            icon: <MdCalendarToday /> },
  { name: "Messages",       href: "/dashboard/messages",            icon: <MdMessage /> },
  { name: "Reviews",        href: "/dashboard/reviews",             icon: <MdRateReview /> },
  { name: "My Referrals",   href: "/dashboard/agents",              icon: <MdHandshake /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdNotifications /> },
];

const BUYER_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Saved Experts",  href: "/dashboard/saved",               icon: <MdFavorite /> },
  { name: "My Bookings",    href: "/dashboard/bookings",            icon: <MdCalendarToday /> },
  { name: "Messages",       href: "/dashboard/messages",            icon: <MdMessage /> },
  { name: "My Reviews",     href: "/dashboard/reviews",             icon: <MdRateReview /> },
  { name: "My Referrals",   href: "/dashboard/agents",              icon: <MdHandshake /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdNotifications /> },
];

const USER_NAV: NavItem[] = [
  { name: "Dashboard",      href: "/dashboard",                     icon: <MdDashboard /> },
  { name: "Bookings",       href: "/dashboard/bookings",            icon: <MdCalendarToday /> },
  { name: "Reviews",        href: "/dashboard/reviews",             icon: <MdRateReview /> },
  { name: "My Referrals",   href: "/dashboard/agents",              icon: <MdHandshake /> },
  { name: "Notifications",  href: "/dashboard/notifications",       icon: <MdNotifications /> },
];

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  SUPER_ADMIN:  ADMIN_NAV,
  ADMIN:        ADMIN_NAV,
  MANAGER:      MANAGER_NAV,
  MARKETER:     MARKETER_NAV,
  SEO_EXPERT:   SEO_NAV,
  SALES_AGENT:  SALES_NAV,
  EXPERT:       EXPERT_NAV,
  BUYER:        BUYER_NAV,
  USER:         USER_NAV,
};

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/20 text-red-300 border-red-500/25",
  ADMIN:       "bg-purple-500/20 text-purple-300 border-purple-500/25",
  MANAGER:     "bg-blue-500/20 text-blue-300 border-blue-500/25",
  MARKETER:    "bg-pink-500/20 text-pink-300 border-pink-500/25",
  SEO_EXPERT:  "bg-teal-500/20 text-teal-300 border-teal-500/25",
  SALES_AGENT: "bg-green-500/20 text-green-300 border-green-500/25",
  EXPERT:      "bg-orange-500/20 text-orange-300 border-orange-500/25",
  BUYER:       "bg-cyan-500/20 text-cyan-300 border-cyan-500/25",
  USER:        "bg-slate-700 text-slate-300 border-slate-600",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  MANAGER:     "Manager",
  MARKETER:    "Marketer",
  SEO_EXPERT:  "SEO Expert",
  SALES_AGENT: "Sales Agent",
  EXPERT:      "Expert",
  BUYER:       "Buyer",
  USER:        "User",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const r = await fetch("/api/notifications?unread=1");
        if (r.ok) { const d = await r.json(); setUnreadCount(d.unreadCount || 0); }
      } catch {}
    };
    if (session?.authenticated) {
      fetchUnread();
      const t = setInterval(fetchUnread, 30000);
      return () => clearInterval(t);
    }
  }, [session]);

  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev);
    document.addEventListener('toggle-dashboard-sidebar', handler);
    return () => document.removeEventListener('toggle-dashboard-sidebar', handler);
  }, []);

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
  const navItems = NAV_BY_ROLE[role] || USER_NAV;
  const roleColor = ROLE_COLOR[role] || ROLE_COLOR.USER;
  const roleLabel = ROLE_LABEL[role] || role;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? "w-full" : "w-64 hidden md:flex"} flex-col bg-slate-950 border-r border-white/8 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto`}>
      {/* Brand (mobile only — desktop Navbar already shows logo) */}
      {mobile && (
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <LogoMark size={26} />
            <span className="text-sm font-bold text-white tracking-tight">
              <span className="text-orange-400">Expert</span>Near.Me
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
            <MdClose size={22} />
          </button>
        </div>
      )}

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-white/5">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${roleColor}`}>
          {roleLabel}
        </span>
        <p className="text-xs text-slate-500 mt-1 truncate">{session.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                pathname === item.href
                  ? "bg-[#b84c4c] text-white"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className={`text-lg ${active ? "text-orange-400" : "text-slate-500"}`}>{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.href === "/dashboard/notifications" && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          ))}
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
    <div className="flex min-h-screen bg-slate-900 text-white pt-16">
      <Sidebar />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full bg-slate-950 pt-16">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}