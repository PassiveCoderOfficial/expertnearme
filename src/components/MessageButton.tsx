"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function MessageButton({ toUserId, label = "Message" }: { toUserId: number; label?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    // Check if logged in
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      router.push("/login?redirect=/dashboard/messages");
      return;
    }
    // Create or get conversation
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, content: "Hi, I'd like to connect with you." }),
    });
    if (r.ok) {
      router.push("/dashboard/messages");
    } else {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60 w-full"
    >
      <MessageCircle className="w-4 h-4" />
      {loading ? "Opening…" : label}
    </button>
  );
}
