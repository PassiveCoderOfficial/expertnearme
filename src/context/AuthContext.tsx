// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Session {
  ok: boolean;
  authenticated: boolean;
  role?: string;
  userId?: number;
}

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  verified: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;   // ✅ add logout
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},     // ✅ default no‑op
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);

      if (data.authenticated) {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.ok) {
          setUser(meData.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth refresh error:", err);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // ✅ logout clears cookie and resets state
  const logout = () => {
    // clear cookie by calling a logout API or setting expired cookie
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      setSession(null);
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
