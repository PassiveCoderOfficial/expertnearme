"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  MdPeople, MdPerson, MdCalendarToday, MdRateReview, MdStar,
  MdVerified, MdTrendingUp, MdOpenInNew, MdEdit,
} from "react-icons/md";
import { Crown } from "lucide-react";

interface AdminStats {
  role: "ADMIN";
  totalExperts: number;
  totalUsers: number;
  totalBookings: number;
  totalReviews: number;
  foundingExperts: number;
  recentExperts: { id: number; name: string; businessName: string | null; countryCode: string | null; verified: boolean; createdAt: string }[];
}

interface ExpertStats {
  role: "EXPERT";
  expert: { id: number; name: string; businessName: string | null; countryCode: string | null; profileLink: string | null; verified: boolean; foundingExpert: boolean; shortDesc: string | null } | null;
  bookings: number;
  reviewCount: number;
  avgRating: number | null;
}

interface UserStats {
  role: "USER";
  bookings: number;
}

type Stats = AdminStats | ExpertStats | UserStats;

function StatCard({ label, value, icon, accent = false }: { label: string; value: string | number; icon: React.ReactNode; accent?: boolean }) {
  const isLong = typeof value === "string" && value.length > 6;
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${accent ? "bg-orange-500/10 border-orange-500/25" : "bg-slate-800/50 border-white/8"}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${accent ? "bg-orange-500/20 text-orange-400" : "bg-slate-700/60 text-slate-400"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-bold leading-tight ${isLong ? "text-base" : "text-2xl"} ${accent ? "text-orange-400" : "text-white"}`}>{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
