"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import MediaBrowser from "@/components/media/MediaBrowser";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsPage() {
  const { session } = useAuth();
  const role = session?.role || "USER";
  const { toast } = useToast();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [openLogoPicker, setOpenLogoPicker] = useState(false);
  const [openFaviconPicker, setOpenFaviconPicker] = useState(false);

  // Load current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings/site", {
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load settings:", text);
          toast("Failed to load settings", { type: "error" });
          return;
        }
        const data = await res.json();
        setLogoUrl(data.logo || null);
        setFaviconUrl(data.favicon || null);
      } catch (err) {
        console.error("Failed to load settings", err);
        toast("Failed to load settings", { type: "error" });
      } finally {
        setLoading(false);
      }
    }

    if (role === "ADMIN") {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [role, toast]);

  // saveSettings returns { success, message } so caller can show anchored toast
  async function saveSettings(): Promise<{ success: boolean; message?: string }> {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ logo: logoUrl, favicon: faviconUrl }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Save settings failed:", text);
        return { success: false, message: text || "Save failed" };
      }

      const data = await res.json();
      if (data.success) {
        return { success: true, message: "Settings saved" };
      } else {
        return { success: false, message: data.error || "Unknown error" };
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      return { success: false, message: "Failed to save settings" };
    } finally {
      setSaving(false);
    }
  }

  // Inline handler that anchors toast to the clicked button
  async function handleSaveClick(e: React.MouseEvent<HTMLButtonElement>) {
    // compute bounding rect of the clicked button
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    // call save
    const result = await saveSettings();

    // build anchorRect for toast provider (screen coordinates)
    const anchorRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    if (result.success) {
      toast("Settings saved", { type: "success", anchorRect });
    } else {
      toast(`Error: ${result.message}`, { type: "error", anchorRect });
    }
  }

  if (loading) return <p className="p-8">Loading settings...</p>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Common settings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Profile Settings</h2>
        <p className="text-sm text-gray-600 mb-3">
          Update your name, avatar, and notification preferences.
        </p>
      </section>

      {/* Admin-only site settings */}
      {role === "ADMIN" && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Site Settings (Admin Only)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Configure site logo, favicon, and global branding.
          </p>

          {/* Logo */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Logo</h3>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-12 mb-3" />
            ) : (
              <p className="text-sm text-gray-600 mb-3">No logo selected.</p>
            )}
            <button
              onClick={() => setOpenLogoPicker(true)}
              className="px-4 py-2 bg-[#b84c4c] text-white rounded-md"
            >
              Upload / Select Logo
            </button>
            <MediaBrowser
              open={openLogoPicker}
              onClose={() => setOpenLogoPicker(false)}
              onSelect={(media) => {
                setLogoUrl(media.url);
                setOpenLogoPicker(false);
                toast("Logo selected", { type: "success" });
              }}
              allowAllMedia={role === "ADMIN"}
              mode="modal"
            />
          </div>

          {/* Favicon */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Favicon</h3>
            {faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={faviconUrl} alt="Favicon" className="h-10 mb-3" />
            ) : (
              <p className="text-sm text-gray-600 mb-3">No favicon selected.</p>
            )}
            <button
              onClick={() => setOpenFaviconPicker(true)}
              className="px-4 py-2 bg-[#b84c4c] text-white rounded-md"
            >
              Upload / Select Favicon
            </button>
            <MediaBrowser
              open={openFaviconPicker}
              onClose={() => setOpenFaviconPicker(false)}
              onSelect={(media) => {
                setFaviconUrl(media.url);
                setOpenFaviconPicker(false);
                toast("Favicon selected", { type: "success" });
              }}
              allowAllMedia={role === "ADMIN"}
              mode="modal"
            />
          </div>

          <button
            onClick={handleSaveClick}
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
        </section>
      )}
    </main>
  );
}
