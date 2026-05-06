"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, Upload, X, CheckCircle2, Loader2 } from "lucide-react";

type WorkItem = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  tags: string | null;
  published: boolean;
  createdAt: string;
};

const empty = (): Omit<WorkItem, "id" | "createdAt"> => ({
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  tags: "",
  published: true,
});

export default function CompletedWorkDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(empty());

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/me/completed-work");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
    setLoading(false);
  }

  function openNew() {
    setForm(empty());
    setEditingId(null);
    setIsOpen(true);
    setError(null);
  }

  function openEdit(item: WorkItem) {
    setForm({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      tags: item.tags || "",
      published: item.published,
    });
    setEditingId(item.id);
    setIsOpen(true);
    setError(null);
  }

  function uploadImage() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Max file size 10MB"); return; }

    setUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setForm((f) => ({ ...f, imageUrl: data.url }));
      } else {
        setError("Upload failed");
      }
    };
    xhr.onerror = () => { setUploading(false); setError("Upload failed"); };
    xhr.open("POST", "/api/media");
    xhr.send(fd);
  }

  async function save() {
    if (!form.title.trim()) { setError("Title required"); return; }
    setSaving(true);
    setError(null);

    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch("/api/me/completed-work", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess(editingId ? "Updated!" : "Posted!");
      setIsOpen(false);
      load();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      const d = await res.json();
      setError(d.error || "Failed");
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/me/completed-work?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function togglePublish(item: WorkItem) {
    const res = await fetch("/api/me/completed-work", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, published: !i.published } : i));
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 mb-1 font-semibold">Dashboard</p>
            <h1 className="text-2xl font-bold">Completed Work</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Posts appear on the public <a href="/completed-work" className="text-orange-500 hover:underline" target="_blank">/completed-work</a> page and homepage feed.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Post
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl mb-6">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-20 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-slate-500 mb-4">No posts yet. Share your first completed project!</p>
            <button onClick={openNew} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Post Completed Work
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none flex flex-col">
                {item.imageUrl ? (
                  <div className="w-full h-40 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-orange-500/10 to-amber-500/5 dark:from-orange-500/15 dark:to-amber-500/8 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-orange-400/30" />
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-2 flex-1">{item.title}</h3>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${item.published ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                      {item.published ? "Live" : "Hidden"}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3 flex-1">{item.description}</p>
                  )}

                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => togglePublish(item)} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      {item.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {item.published ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => remove(item.id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors ml-auto">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Post" : "New Completed Work Post"}
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Completed kitchen renovation in Dubai"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Briefly describe what was done, scope, results..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Project Image</label>
                  {form.imageUrl ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={uploadImage}
                      disabled={uploading}
                      className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-xs">{uploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span className="text-xs font-medium">Click to upload image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Video / Demo Link</label>
                  <input
                    value={form.videoUrl || ""}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Tags <span className="text-slate-400 normal-case font-normal">(comma-separated)</span></label>
                  <input
                    value={form.tags || ""}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="renovation, kitchen, Dubai"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${form.published ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-4.5" : ""}`} />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Publish publicly</span>
                </label>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-white/8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium px-5 py-2.5 rounded-xl hover:border-slate-300 dark:hover:border-white/20 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingId ? "Save Changes" : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
