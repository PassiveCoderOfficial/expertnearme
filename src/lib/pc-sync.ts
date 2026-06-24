// Server-only — call PC's reverse provision when an ENM user upgrades to Pro
const PC_BASE_URL = (process.env.PC_BASE_URL ?? "https://passivecoder.com").replace(/\/$/, "");
const PARTNER_SECRET = process.env.PARTNER_SECRET ?? "";

export type PCTier = "free" | "pro";

/** Notify PC that an ENM user has a new tier. Fire-and-forget — never blocks response. */
export async function syncToPC(opts: {
  userId: number;
  email: string;
  name?: string | null;
  tier: PCTier;
}): Promise<void> {
  const { userId, email, name, tier } = opts;
  await fetch(`${PC_BASE_URL}/api/partner/provision-from-enm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-partner-secret": PARTNER_SECRET,
    },
    body: JSON.stringify({ email, name: name ?? undefined, enmUserId: userId, tier }),
  });
}
