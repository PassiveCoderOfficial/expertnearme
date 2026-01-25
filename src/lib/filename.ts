// src/lib/filename.ts
/**
 * Helpers for sanitizing and generating unique filenames for Supabase Storage.
 */

export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-zA-Z0-9.\-_ ]+/g, "") // remove special chars except . - _
    .trim()
    .replace(/\s+/g, "-") // spaces -> hyphen
    .replace(/-+/g, "-") // collapse hyphens
    .toLowerCase();
}

export function splitNameExt(filename: string) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return { base: filename, ext: "" };
  return { base: filename.slice(0, idx), ext: filename.slice(idx) };
}

/**
 * Check for an available filename in a Supabase bucket/folder and append -n suffixes if needed.
 * This function expects a Supabase server client with `storage.from(bucket).list(folder)` available.
 *
 * Usage:
 *   const unique = await getUniqueFilename(supabaseServer, "uploads", "folder", "base-name", ".png")
 */
export async function getUniqueFilename(
  supabaseServer: any,
  bucket: string,
  folder: string,
  baseName: string,
  ext: string
) {
  // Candidate without suffix first
  let candidate = `${baseName}${ext}`;
  let counter = 1;

  // We'll list the folder once and check for collisions. If folder is large, this may need pagination.
  // Use prefix listing to limit results to the folder.
  try {
    const { data: listData, error: listError } = await supabaseServer.storage
      .from(bucket)
      .list(folder, { limit: 1000 });

    if (listError) {
      // If listing fails, return the candidate (upload will fail if collision occurs).
      console.warn("Supabase list warning:", listError);
      return candidate;
    }

    const existingNames = new Set((listData || []).map((f: any) => f.name));

    while (existingNames.has(candidate)) {
      counter++;
      candidate = `${baseName}-${counter}${ext}`;
    }

    return candidate;
  } catch (err) {
    console.warn("getUniqueFilename error:", err);
    return candidate;
  }
}
