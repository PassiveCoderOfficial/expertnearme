// File: src/hooks/useRequireRole.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function useRequireRole(allowed: string[] = []) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const role = session?.role || null;
      if (!session?.authenticated) {
        router.push("/login");
        return;
      }
      if (allowed.length > 0 && !allowed.includes(role || "")) {
        // redirect to dashboard root if not allowed
        router.push("/dashboard");
      }
    }
  }, [session, loading, allowed, router]);
}
