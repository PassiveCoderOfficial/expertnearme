// File: src/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [required, setRequired] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setRequired(data.emailVerificationRequired));
  }, []);

  async function toggleSetting() {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailVerificationRequired: !required }),
    });
    setRequired(!required);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Platform Settings</h2>
      <button
        onClick={toggleSetting}
        className="bg-gray-700 px-4 py-2 rounded text-white"
      >
        Email Verification Required: {required ? "ON" : "OFF"}
      </button>
    </div>
  );
}
