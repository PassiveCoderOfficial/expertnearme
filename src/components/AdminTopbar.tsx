// src/components/AdminTopbar.tsx
"use client";

import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function AdminTopbar({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <header
      className={`flex items-center justify-between px-6 py-3 border-b ${
        darkMode ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-900"
      }`}
    >
      <h1 className="text-lg font-bold">ExpertNear.Me Admin</h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
        type="button"
        aria-pressed={darkMode}
      >
        {darkMode ? <MdLightMode /> : <MdDarkMode />}
        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </header>
  );
}
