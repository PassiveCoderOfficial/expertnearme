"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { MdClose, MdUpload, MdRefresh, MdSearch, MdDelete, MdContentCopy, MdOpenInNew, MdPhotoLibrary } from "react-icons/md";

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

export default function MediaBrowser({ open, onClose, onSelect, allowAllMedia = false, mode = "modal" }: MediaBrowserProps) {
  const [tab, setTab] = useState<"upload" | "my" | "all">("upload");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const { toast, confirm } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (file) uploadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    async function fetchMedia(scope: "self" | "all") {
      try {
        const res = await fetch(`/api/media?scope=${scope}&sort=latest`, { credentials: "include" });
        if (res.ok) setItems(await res.json());
        else toast("Failed to load media", { type: "error" });
      } catch { toast("Failed to load media", { type: "error" }); }
    }
    if (tab === "my") fetchMedia("self");
    if (tab === "all" && allowAllMedia) fetchMedia("all");
  }, [tab, allowAllMedia, refreshKey, toast]);

  const displayed = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((m) => m.filename.toLowerCase().includes(q) || (m.tags || "").toLowerCase().includes(q));
  }, [items, search]);

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
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const newItem: MediaItem = JSON.parse(xhr.responseText);
              setItems((prev) => [newItem, ...prev]);
              setFile(null);
              setTab("my");
              toast("Uploaded", { type: "success" });
              resolve();
            } catch { reject(new Error("Invalid server response")); }
          } else if (xhr.status === 403) {
            reject(new Error("Unauthorized — please log in"));
          } else {
            reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Upload failed");
      toast(err?.message || "Upload failed", { type: "error" });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({ title: "Delete media", message: "Delete this file? This cannot be undone.", confirmLabel: "Delete", cancelLabel: "Cancel" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setItems((prev) => prev.filter((m) => m.id !== id)); toast("Deleted", { type: "success" }); }
      else toast("Delete failed", { type: "error" });
    } catch { toast("Delete failed", { type: "error" }); }
  }

  function buildUrl(url: string) {
    if (/^https?:\/\//i.test(url)) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  }

  async function copyUrl(url: string) {
    try { await navigator.clipboard.writeText(buildUrl(url)); toast("Copied", { type: "success" }); }
    catch { toast("Copy failed", { type: "error" }); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  if (mode === "modal" && !open) return null;

  const TABS = [
    { key: "upload", label: "Upload" },
    { key: "my",     label: "My Files" },
    ...(allowAllMedia ? [{ key: "all", label: "All Files" }] : []),
  ];

  const inner = (
    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl" style={{ maxHeight: mode === "page" ? undefined : "85vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400">
            <MdPhotoLibrary />
          </div>
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-orange-500/15 text-orange-300 border border-orange-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRefreshKey((k) => k + 1)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Refresh">
            <MdRefresh />
          </button>
          {mode === "modal" && (
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <MdClose />
            </button>
          )}
        </div>
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div className="p-6 flex-1">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors ${dragging ? "border-orange-500/60 bg-orange-500/5" : "border-white/12 hover:border-white/20 bg-slate-800/30"}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
              <MdUpload size={28} />
            </div>
            <p className="text-white font-medium mb-1">Drop a file here</p>
            <p className="text-slate-500 text-sm mb-5">or click to browse your device</p>
            <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="mediaFileInput" />
            <label htmlFor="mediaFileInput" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-900 font-semibold text-sm rounded-xl cursor-pointer transition-colors">
              Choose File
            </label>

            {uploading && (
              <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                <div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-3" />
                <p className="text-sm text-white mb-3">Uploading… {progress}%</p>
                <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div style={{ width: `${progress}%` }} className="h-full bg-orange-500 transition-all rounded-full" />
                </div>
                {errorMessage && <p className="text-xs text-red-400 mt-3">{errorMessage}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media grid */}
      {(tab === "my" || tab === "all") && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search bar */}
          <div className="px-5 py-3 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2">
              <MdSearch className="text-slate-500 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by filename or tag…" className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {displayed.length === 0 ? (
              <div className="text-center py-14 text-slate-500 text-sm">No media found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayed.map((m) => (
                  <div key={m.id} className="group relative rounded-xl border border-white/8 bg-slate-800/50 overflow-hidden hover:border-orange-500/30 transition-colors">
                    {/* Thumbnail */}
                    <button
                      type="button"
                      onClick={() => { onSelect?.(m); if (onSelect) toast("Selected", { type: "success" }); }}
                      className={`w-full h-28 bg-slate-900/60 flex items-center justify-center overflow-hidden ${onSelect ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {m.mimetype.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      ) : (
                        <div className="text-xs text-slate-500 px-2 text-center break-all">{m.filename}</div>
                      )}
                    </button>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs text-slate-300 truncate" title={m.filename}>{m.filename}</p>
                      <p className="text-xs text-slate-600">{m.mimetype.split("/")[1]?.toUpperCase()}</p>
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => window.open(buildUrl(m.url), "_blank")} className="p-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg" title="Open"><MdOpenInNew size={13} /></button>
                      <button onClick={() => copyUrl(m.url)} className="p-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg" title="Copy URL"><MdContentCopy size={13} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1 bg-slate-900/80 hover:bg-red-500/80 text-slate-300 rounded-lg" title="Delete"><MdDelete size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "page") return inner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {inner}
    </div>
  );
}
