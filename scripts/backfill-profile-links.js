// File: scripts/backfill-profile-links.js
// Run: node scripts/backfill-profile-links.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Local slugify implementation matching your filename.ts behavior:
 * - normalize, remove diacritics
 * - remove special chars except . - _
 * - collapse spaces to hyphens, lowercase
 */
function slugify(text) {
  if (!text) return "";
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

function getUniqueCandidate(base, existing) {
  const baseSlug = slugify(base || "");
  if (!baseSlug) return "";
  if (!existing.has(baseSlug)) return baseSlug;
  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;
  while (existing.has(candidate)) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}

async function main() {
  console.log("Loading existing slugs...");
  const all = await prisma.expert.findMany({ select: { id: true, profileLink: true } });
  const existing = new Set(all.map((r) => (r.profileLink || "").toLowerCase()).filter(Boolean));

  // Select only fields that exist in your schema: id, businessName, name
  const toUpdate = await prisma.expert.findMany({
    where: { OR: [{ profileLink: null }, { profileLink: "" }] },
    select: { id: true, businessName: true, name: true },
  });

  console.log(`Found ${toUpdate.length} experts to backfill.`);
  for (const row of toUpdate) {
    // Prefer businessName, then name, then fallback to expert-{id}
    const base = row.businessName || row.name || `expert-${row.id}`;
    let candidate = getUniqueCandidate(base, existing);
    if (!candidate) candidate = `expert-${row.id}`;
    existing.add(candidate);
    await prisma.expert.update({
      where: { id: row.id },
      data: { profileLink: candidate },
    });
    console.log(`Updated id=${row.id} -> ${candidate}`);
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
