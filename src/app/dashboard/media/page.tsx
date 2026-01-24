"use client";

import { useAuth } from "@/context/AuthContext";
import MediaBrowser from "@/components/media/MediaBrowser";

export default function MediaPage() {
  const { session } = useAuth();
  const role = session?.role || "USER";

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Media Manager</h1>

      {/* Inline MediaBrowser */}
      <MediaBrowser
        open={true} // always visible inline
        onClose={() => {}}
        allowAllMedia={role === "ADMIN"}
        mode="page"
      />
    </main>
  );
}
