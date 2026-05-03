"use client";

import { useAuth } from "@/context/AuthContext";
import MediaBrowser from "@/components/media/MediaBrowser";

export default function MediaPage() {
  const { session } = useAuth();
  const role = session?.role || "USER";

  return (
    <div className="max-w-5xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Media</h1>
        <p className="text-xs text-slate-400 mt-0.5">Upload and manage images and files used across the platform.</p>
      </div>
      <MediaBrowser
        open={true}
        onClose={() => {}}
        allowAllMedia={["ADMIN", "SUPER_ADMIN", "MANAGER", "MARKETER"].includes(role)}
        mode="page"
      />
    </div>
  );
}
