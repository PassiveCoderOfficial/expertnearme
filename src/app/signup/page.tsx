"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/Logo";
import { Eye, EyeOff, Mail, Lock, User, Search, Star, Handshake } from "lucide-react";

type SignupRole = "BUYER" | "EXPERT" | "SALES_AGENT";

const ROLE_OPTIONS: { value: SignupRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "BUYER",
    label: "Buyer",
    desc: "Find & book experts",
    icon: <Search className="w-5 h-5" />,
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  },
  {
    value: "EXPERT",
    label: "Expert",
    desc: "List your services",
    icon: <Star className="w-5 h-5" />,
    color: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  },
  {
    value: "SALES_AGENT",
    label: "Agent",
    desc: "Refer & earn commissions",
    icon: <Handshake className="w-5 h-5" />,
    color: "border-green-500/40 bg-green-500/10 text-green-300",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { session, loading, refresh } = useAuth();
  const [role, setRole] = useState<SignupRole>("BUYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session?.authenticated) router.push("/dashboard");
  }, [loading, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.emailVerificationRequired === false) {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const loginData = await loginRes.json();
          if (loginData.ok) {
            await refresh();
            router.push("/dashboard");
          } else {
            setError("Signup succeeded but auto-login failed. Please log in manually.");
          }
        } else {
          router.push("/verify");
        }
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <LogoMark size={36} />
          <span className="text-xl font-bold text-white tracking-tight">
            ExpertNear<span className="text-orange-400">.Me</span>
          </span>
        </Link>

        <div className="bg-slate-800/60 border border-white/8 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-slate-400 text-sm mb-6">Choose how you'll use ExpertNear.Me</p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all text-center ${
                  role === opt.value
                    ? opt.color + " border-2"
                    : "border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-400"
                }`}
              >
                {opt.icon}
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[10px] leading-tight opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 text-sm text-red-300 bg-red-500/15 border border-red-500/25 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-900 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? "Creating account…" : `Create ${ROLE_OPTIONS.find(r => r.value === role)?.label} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          You can switch between Buyer, Expert, and Agent views anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
