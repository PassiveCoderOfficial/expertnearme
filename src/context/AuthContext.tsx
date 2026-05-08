"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Session {
  ok: boolean;
  authenticated: boolean;
  role?: string;
  activeRole?: string;
  roles?: string[];
  userId?: number;
  email?: string;
}

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  roles: string[];
  activeRole: string;
  defaultRole: string;
  verified: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  switchRole: (role: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
  switchRole: async () => false,
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

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      setSession(null);
      setUser(null);
      window.location.href = "/";
    });
  };

  const switchRole = async (role: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.ok) {
        await refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, refresh, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
