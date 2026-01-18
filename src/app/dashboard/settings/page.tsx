// src/app/dashboard/settings/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [emailVerification, setEmailVerification] = useState<"ON" | "OFF">("ON");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.ok && mounted) {
          setEmailVerification(data.value === "ON" ? "ON" : "OFF");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const toggle = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const newVal = emailVerification === "ON" ? "OFF" : "ON";
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newVal }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmailVerification(data.setting.value === "ON" ? "ON" : "OFF");
        setMessage("Saved.");
      } else {
        setMessage(data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <main>
      <h2 className="text-2xl font-bold mb-4">Platform Settings</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <div className="font-semibold">Email Verification Required</div>
              <div className="text-sm text-gray-600">When ON, new users must verify email before accessing dashboard.</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">{emailVerification}</div>
              <button
                onClick={toggle}
                disabled={saving}
                className="px-3 py-1 rounded bg-[#b84c4c] text-white text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Toggle"}
              </button>
            </div>
          </div>

          {message && <div className="text-sm text-green-600">{message}</div>}
        </div>
      )}
    </main>
  );
}
