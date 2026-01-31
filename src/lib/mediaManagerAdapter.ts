// File: src/lib/mediaManagerAdapter.ts
export type MediaSelectResult = { url: string; id?: number } | null;

/**
 * Adapter to integrate with the existing Media Manager.
 *
 * Strategy (in order):
 * 1) If the host app exposes window.openMediaManager(), call it and await selection.
 *    Expected contract: window.openMediaManager(options) -> Promise<{ url, id }>
 * 2) If a file is provided and server upload endpoint exists, POST multipart/form-data
 *    to /api/media/upload and return the returned URL.
 * 3) Fallback: prompt the user to paste a public URL.
 *
 * This file intentionally keeps the adapter generic so you can wire it to your
 * Media Manager implementation without duplicating upload logic.
 */
export async function pickOrUploadMedia(file?: File, opts: { accept?: string } = {}): Promise<MediaSelectResult> {
  // Strategy 1: host-provided modal
  try {
    // @ts-ignore
    if (typeof window !== "undefined" && typeof (window as any).openMediaManager === "function") {
      // openMediaManager should return a Promise that resolves to { url, id }
      // Example: await window.openMediaManager({ accept: "image/*", multiple: false })
      // If your Media Manager uses a different API, adapt this call.
      // @ts-ignore
      const selected = await (window as any).openMediaManager({ accept: opts.accept });
      if (selected && selected.url) return selected;
    }
  } catch (err) {
    console.warn("mediaManager modal adapter failed:", err);
  }

  // Strategy 2: server upload endpoint
  if (file) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Adjust endpoint if your media manager uses a different path
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      if (res.ok) {
        const json = await res.json();
        // Common response shapes:
        // { url: "...", id: 123 } or { uploaded: [{ publicURL: "..." }] }
        if (json.url) return { url: json.url, id: json.id };
        if (json.uploaded && json.uploaded[0]?.publicURL) return { url: json.uploaded[0].publicURL };
        if (json.uploaded && json.uploaded[0]?.url) return { url: json.uploaded[0].url };
      } else {
        console.warn("server upload failed:", await res.text());
      }
    } catch (err) {
      console.warn("server upload adapter failed:", err);
    }
  }

  // Strategy 3: URL fallback
  if (typeof window !== "undefined") {
    const url = window.prompt("Paste image URL (or Cancel to abort):");
    if (url && url.trim()) return { url: url.trim() };
  }

  return null;
}
