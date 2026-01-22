// src/app/dashboard/media/page.tsx
"use client";

import { useState } from "react";

type MediaItem = {
  id: number;
  url: string;
  filename: string;
  mimetype: string;
  uploadedById: number;
  uploadedByEmail?: string;
  createdAt: string;
};

const mockMedia: MediaItem[] = [
  {
    id: 1,
    url: "/uploads/1/logo.png",
    filename: "logo.png",
    mimetype: "image/png",
    uploadedById: 1,
    uploadedByEmail: "admin@example.com",
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: 2,
    url: "/uploads/2/avatar.jpg",
    filename: "avatar.jpg",
    mimetype: "image/jpeg",
    uploadedById: 2,
    uploadedByEmail: "user@example.com",
    createdAt: "2026-01-21T15:30:00Z",
  },
];

export default function MediaPage() {
  const [scope, setScope] = useState<"self" | "all">("self");
  const [sort, setSort] = useState<"latest" | "userId" | "email">("latest");
  const [items, setItems] = useState<MediaItem[]>(mockMedia);
  const [file, setFile] = useState<File | null>(null);

  // Sorting logic (mock only)
  const sortedItems = [...items].sort((a, b) => {
    if (sort === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === "userId") {
      return a.uploadedById - b.uploadedById;
    }
    if (sort === "email") {
      return (a.uploadedByEmail || "").localeCompare(b.uploadedByEmail || "");
    }
    return 0;
  });

  // Filter by scope (mock only)
  const filteredItems =
    scope === "self"
      ? sortedItems.filter((m) => m.uploadedById === 1) // pretend current user = id 1
      : sortedItems;

  function uploadMock() {
    if (!file) return;
    const newItem: MediaItem = {
      id: items.length + 1,
      url: URL.createObjectURL(file),
      filename: file.name,
      mimetype: file.type,
      uploadedById: 1,
      uploadedByEmail: "admin@example.com",
      createdAt: new Date().toISOString(),
    };
    setItems([newItem, ...items]);
    setFile(null);
  }

  function deleteMock(id: number) {
    setItems(items.filter((m) => m.id !== id));
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Media Manager (Mock)</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          <button
            className={`px-4 py-2 ${
              scope === "self" ? "bg-[#b84c4c] text-white" : "bg-white text-gray-700"
            }`}
            onClick={() => setScope("self")}
          >
            My Media
          </button>
          <button
            className={`px-4 py-2 ${
              scope === "all" ? "bg-[#b84c4c] text-white" : "bg-white text-gray-700"
            }`}
            onClick={() => setScope("all")}
          >
            All Media
          </button>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-md"
        >
          <option value="latest">Sort: Latest</option>
          <option value="userId">Sort: User ID</option>
          <option value="email">Sort: Email</option>
        </select>

        <div className="ml-auto flex items-center gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            onClick={uploadMock}
            className="px-4 py-2 rounded-md bg-[#b84c4c] text-white hover:bg-[#a43f3f]"
          >
            Upload (Mock)
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-gray-600">No media found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredItems.map((m) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-3">
              <div className="aspect-video bg-gray-50 rounded mb-2 overflow-hidden">
                <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
              </div>
              <div className="text-sm font-medium">{m.filename}</div>
              <div className="text-xs text-gray-600">{m.mimetype}</div>
              {m.uploadedByEmail && (
                <div className="text-xs text-gray-600">By: {m.uploadedByEmail}</div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={m.url}
                  target="_blank"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Open
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(m.url)}
                  className="text-xs text-gray-700"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => deleteMock(m.id)}
                  className="ml-auto text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
