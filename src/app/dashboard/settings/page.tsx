"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type MediaItem = {
  id: number;
  url: string;
  filename: string;
};

// Mock media for logo/favicon selection
const mockMedia: MediaItem[] = [
  { id: 1, url: "/uploads/1/logo.png", filename: "logo.png" },
  { id: 2, url: "/uploads/2/favicon.ico", filename: "favicon.ico" },
  { id: 3, url: "/uploads/1/banner.jpg", filename: "banner.jpg" },
];

export default function SettingsPage() {
  const { session } = useAuth();
  const role = session?.role || "USER";

  // Admin site settings state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function saveMock() {
    setSaving(true);
    setTimeout(() => {
      alert(`Saved settings:\nLogo: ${logoUrl}\nFavicon: ${faviconUrl}`);
      setSaving(false);
    }, 800);
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Common settings visible to all roles */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Profile Settings</h2>
        <p className="text-sm text-gray-600 mb-3">
          Update your name, avatar, and notification preferences.
        </p>
        {/* TODO: Add profile form fields here */}
      </section>

      {/* Admin-only site settings */}
      {role === "ADMIN" && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Site Settings (Admin Only)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Configure site logo, favicon, and global branding.
          </p>

          {/* Logo selector */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Logo</h3>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 mb-3" />
            ) : (
              <p className="text-sm text-gray-600 mb-3">No logo selected.</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {mockMedia.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setLogoUrl(m.url)}
                  className={`border rounded p-2 ${
                    logoUrl === m.url ? "border-[#b84c4c]" : "border-gray-200"
                  }`}
                >
                  <img
                    src={m.url}
                    alt={m.filename}
                    className="h-12 w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Favicon selector */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Favicon</h3>
            {faviconUrl ? (
              <img src={faviconUrl} alt="Favicon" className="h-10 mb-3" />
            ) : (
              <p className="text-sm text-gray-600 mb-3">No favicon selected.</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {mockMedia.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFaviconUrl(m.url)}
                  className={`border rounded p-2 ${
                    faviconUrl === m.url ? "border-[#b84c4c]" : "border-gray-200"
                  }`}
                >
                  <img
                    src={m.url}
                    alt={m.filename}
                    className="h-10 w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={saveMock}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-[#b84c4c] text-white hover:bg-[#a43f3f]"
          >
            {saving ? "Saving..." : "Save site settings"}
          </button>
        </section>
      )}

      {/* Expert-specific settings */}
      {role === "EXPERT" && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Expert Settings</h2>
          <p className="text-sm text-gray-600 mb-3">
            Manage your categories, availability, and business profile.
          </p>
          {/* TODO: Add expert-specific fields here */}
        </section>
      )}
    </main>
  );
}
