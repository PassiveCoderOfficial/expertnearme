"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/ToastProvider";

type MediaItem = {
  id: number;
  url: string;
  filename: string;
  mimetype: string;
  uploadedByEmail?: string;
  folder?: string | null;
  tags?: string | null;
};

interface MediaBrowserProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (media: MediaItem) => void;
  allowAllMedia?: boolean;
  mode?: "modal" | "page";
}

export default function MediaBrowser({
  open,
  onClose,
  onSelect,
  allowAllMedia = false,
  mode = "modal",
}: MediaBrowserProps) {
  const [tab, setTab] = useState<"upload" | "my" | "all">("upload");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [folderFilter, setFolderFilter] = useState<"all" | "admin" | "mine">(
    "all"
  );
  const [tagFilter, setTagFilter] = useState<string>("");

  const [refreshKey, setRefreshKey] = useState(0);

  const { toast, confirm } = useToast();

  useEffect(() => {
    if (file) uploadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    async function fetchMedia(scope: "self" | "all") {
      try {
        const res = await fetch(`/api/media?scope=${scope}&sort=latest`, {
          credentials: "include",
        });
        if (res.ok) {
          const data: MediaItem[] = await res.json();
          setItems(data);
        } else {
          const text = await res.text();
          console.error("Failed to fetch media", text);
          toast("Failed to fetch media", { type: "error" });
        }
      } catch (err) {
        console.error("Failed to fetch media", err);
        toast("Failed to fetch media", { type: "error" });
      }
    }

    if (tab === "my") fetchMedia("self");
    if (tab === "all" && allowAllMedia) fetchMedia("all");
  }, [tab, allowAllMedia, refreshKey, toast]);

  const displayedItems = useMemo(() => {
    return items.filter((m) => {
      if (folderFilter === "admin" && m.folder !== "admin") return false;
      if (folderFilter === "mine" && m.folder === "admin") return false;
      if (tagFilter.trim()) {
        const q = tagFilter.trim().toLowerCase();
        const tags = (m.tags || "").toLowerCase();
        if (!tags.includes(q)) return false;
      }
      return true;
    });
  }, [items, folderFilter, tagFilter]);

  async function uploadFile() {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/media", true);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const newItem: MediaItem = JSON.parse(xhr.responseText);
              setItems((prev) => [newItem, ...prev]);
              setFile(null);
              setTab("my");
              setProgress(100);
              toast("Upload successful", { type: "success" });
              resolve();
            } catch (err) {
              reject(new Error("Invalid server response"));
            }
          } else if (xhr.status === 403) {
            reject(new Error("Unauthorized. Please login."));
          } else {
            const msg = xhr.responseText || `Upload failed (${xhr.status})`;
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.send(formData);
      });
    } catch (err: any) {
      console.error("Upload error", err);
      setErrorMessage(err?.message || "Upload failed");
      toast(err?.message || "Upload failed", { type: "error" });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 400);
    }
  }

  async function requestDelete(id: number) {
    const ok = await confirm({
      title: "Delete media",
      message: "Are you sure you want to delete this media item? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((m) => m.id !== id));
        toast("Deleted successfully", { type: "success" });
      } else {
        const text = await res.text();
        toast(`Delete failed: ${text}`, { type: "error" });
      }
    } catch (err) {
      console.error("Delete error", err);
      toast("Delete failed", { type: "error" });
    }
  }

  function buildAbsoluteUrl(rawUrl: string) {
    if (!rawUrl) return rawUrl;
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      return `${window.location.origin}${path}`;
    }
    return path;
  }

  async function copyToClipboard(rawUrl: string) {
    const fullUrl = buildAbsoluteUrl(rawUrl);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        toast("Copied to clipboard", { type: "success" });
        return;
      }

      // fallback: show toast with action to copy using textarea
      toast("Click Copy to copy the URL", {
        type: "info",
        duration: 10000,
        actionLabel: "Copy",
        action: () => {
          try {
            if (typeof document !== "undefined") {
              const textarea = document.createElement("textarea");
              textarea.value = fullUrl;
              textarea.style.position = "fixed";
              textarea.style.left = "-9999px";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand && document.execCommand("copy");
              document.body.removeChild(textarea);
              toast("Copied to clipboard", { type: "success" });
            }
          } catch (err) {
            console.error("Fallback copy failed", err);
            toast("Copy failed", { type: "error" });
          }
        },
      });
    } catch (err) {
      console.error("Copy failed", err);
      toast("Copy failed", { type: "error" });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  }

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  if (mode === "modal" && !open) return null;

  return (
    <div
      className={
        mode === "modal"
          ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          : ""
      }
    >
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-5xl ${
          mode === "modal" ? "p-6" : "p-0"
        }`}
      >
        {/* Header / Tabs */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div className="flex gap-2 items-center">
            {["upload", "my", ...(allowAllMedia ? ["all"] : [])].map((key) => {
              const label =
                key === "upload" ? "Upload" : key === "my" ? "My Media" : "All Media";
              const isActive = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key as any)}
                  className={`px-4 py-2 rounded-t-md font-medium transition-colors duration-300 ${
                    isActive
                      ? "bg-[#b84c4c] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
            <button
              onClick={refresh}
              className="ml-3 px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value as "all" | "admin" | "mine")}
              className="px-3 py-1 border rounded-md bg-white text-sm"
            >
              <option value="all">All folders</option>
              <option value="mine">My folder</option>
              <option value="admin">Admin folder</option>
            </select>

            <input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter by tag"
              className="px-3 py-1 border rounded-md text-sm"
            />

            {mode === "modal" && (
              <button onClick={onClose} className="text-sm text-gray-500">
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Upload Tab */}
        <div className={`transition-opacity duration-300 ${tab === "upload" ? "opacity-100" : "opacity-0 hidden"}`}>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="mb-4 text-gray-600">Drop files here or click to upload</p>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer px-4 py-2 bg-[#b84c4c] text-white rounded-md">
              Choose File
            </label>

            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <div className="text-sm text-gray-700">Uploading... {progress}%</div>
                </div>
                <div className="w-64 h-2 bg-gray-200 rounded mt-4 overflow-hidden">
                  <div style={{ width: `${progress}%` }} className="h-full bg-[#b84c4c] transition-all" />
                </div>
                {errorMessage && <div className="mt-3 text-xs text-red-600">{errorMessage}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className={`transition-opacity duration-300 ${tab === "my" || tab === "all" ? "opacity-100" : "opacity-0 hidden"}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {displayedItems.length === 0 && <div className="col-span-full text-center text-sm text-gray-500">No media found.</div>}

            {displayedItems.map((m) => (
              <div key={m.id} className="border rounded-lg p-2 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    onSelect && onSelect(m);
                    toast("Selected", { type: "success" });
                  }}
                  className="w-full focus:outline-none"
                  aria-label={`Select ${m.filename}`}
                >
                  <div className="w-full h-28 bg-gray-100 rounded overflow-hidden mb-2 flex items-center justify-center cursor-pointer transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400">
                    {m.mimetype.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.filename}
                        className="w-full h-full object-cover border-4 border-transparent hover:border-gray-400"
                        style={{ boxSizing: "border-box" }}
                      />
                    ) : (
                      <div className="text-xs text-gray-600 px-2">{m.filename}</div>
                    )}
                  </div>
                </button>

                <div className="text-sm text-center break-words">{m.filename}</div>
                <div className="text-xs text-gray-500">{m.mimetype}</div>
                {m.uploadedByEmail && <div className="text-xs text-gray-500">By: {m.uploadedByEmail}</div>}
                {m.folder && <div className="text-xs text-gray-500">Folder: {m.folder}</div>}
                {m.tags && <div className="text-xs text-gray-500">Tags: {m.tags}</div>}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => window.open(buildAbsoluteUrl(m.url), "_blank")} className="text-xs text-blue-600">
                    Open
                  </button>
                  <button onClick={() => copyToClipboard(m.url)} className="text-xs text-gray-600">
                    Copy URL
                  </button>
                  <button onClick={() => requestDelete(m.id)} className="text-xs text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
