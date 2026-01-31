// File: src/components/EditExpertButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  expertId: number;
  ownerId?: number | null;
  expertEmail?: string | null;
  className?: string;
};

type MeResponse = {
  ok?: boolean;
  user?: { id?: number; email?: string; role?: string } | null;
  error?: string;
};

export default function EditExpertButton({ expertId, ownerId, expertEmail, className }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch("/api/auth/me");
        const json: MeResponse = await res.json();
        if (!mounted) return;
        const user = json.user || null;
        if (!user) {
          setAllowed(false);
          return;
        }
        // Admins can edit any profile
        if (user.role === "admin") {
          setAllowed(true);
          return;
        }
        // Owner by id
        if (ownerId && user.id && ownerId === user.id) {
          setAllowed(true);
          return;
        }
        // Fallback: match by email
        if (expertEmail && user.email && expertEmail.toLowerCase() === user.email.toLowerCase()) {
          setAllowed(true);
          return;
        }
        setAllowed(false);
      } catch (err) {
        console.error("EditExpertButton: auth check failed", err);
        setAllowed(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [expertId, ownerId, expertEmail]);

  // while checking, render nothing (or a small placeholder)
  if (allowed === null) return null;
  if (!allowed) return null;

  return (
    <Link href={`/dashboard/experts/${expertId}`} className={className || "inline-block"}>
      <button
        type="button"
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        aria-label="Edit expert profile"
      >
        Edit
      </button>
    </Link>
  );
}
