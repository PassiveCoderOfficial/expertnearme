import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PARTNER_SECRET = process.env.PARTNER_SECRET;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "expert";
}

async function uniqueSlug(base: string, countryCode: string, selfId?: number): Promise<string> {
  const slug = slugify(base);
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.expert.findFirst({
      where: { countryCode, profileLink: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === selfId) return candidate;
    n++;
  }
}

/**
 * Upsert the Expert profile for a Passive Coder tenant.
 *
 * Separate from partner/provision on purpose: provisioning creates the account
 * (auth state), this publishes the directory profile (content). They have
 * different failure modes, and an owner can hold an account without wanting a
 * public listing — so a profile update must never be able to disturb auth.
 *
 * Idempotent: called again with the same pcTenantId it updates in place, so PC
 * can re-push whenever the owner edits their business profile.
 */
export async function POST(req: NextRequest) {
  if (!PARTNER_SECRET) return unauthorized();
  if (req.headers.get("x-partner-secret") !== PARTNER_SECRET) return unauthorized();

  let body: {
    pcTenantId: string;
    email: string;
    businessName?: string;
    ownerName?: string;
    primaryService?: string;
    services?: string[];
    serviceAreas?: string[];
    phone?: string;
    whatsapp?: string;
    officeAddress?: string;
    countryCode?: string;
    about?: string;
    yearsOperating?: number | null;
    customersServed?: number | null;
    webAddress?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { pcTenantId } = body;
  const email = (body.email ?? "").trim().toLowerCase();
  if (!pcTenantId || !email) {
    return NextResponse.json({ ok: false, error: "pcTenantId and email are required" }, { status: 400 });
  }

  // The account must already exist — provision runs first.
  const user = await prisma.user.findUnique({ where: { pcTenantId } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "No ENM account for this tenant — provision first" }, { status: 404 });
  }

  const displayName = (body.businessName || body.ownerName || user.name || email.split("@")[0]).trim();
  const countryCode = (body.countryCode ?? "").trim().toLowerCase() || null;

  // Find by email (Expert.email is unique) — the same identity the account uses.
  const existing = await prisma.expert.findUnique({ where: { email } });

  const shared = {
    name: displayName,
    phone: body.phone?.trim() || null,
    whatsapp: body.whatsapp?.trim() || null,
    isBusiness: !!body.businessName,
    businessName: body.businessName?.trim() || null,
    contactPerson: body.ownerName?.trim() || null,
    officeAddress: body.officeAddress?.trim() || null,
    webAddress: body.webAddress?.trim() || null,
    countryCode,
    serviceTitle: body.primaryService?.trim() || null,
    bio: body.about?.trim() || null,
    // shortDesc drives listing cards, where anything long is truncated badly.
    shortDesc: body.primaryService?.trim()?.slice(0, 160) || null,
    // Absent stays absent: these render as public claims on the profile.
    yearsOfExperience: body.yearsOperating ?? null,
    clientsServed: body.customersServed ?? null,
  };

  let expert;
  if (existing) {
    expert = await prisma.expert.update({
      where: { id: existing.id },
      data: {
        ...shared,
        profileLink: existing.profileLink
          ?? (countryCode ? await uniqueSlug(displayName, countryCode, existing.id) : null),
      },
    });
  } else {
    expert = await prisma.expert.create({
      data: {
        ...shared,
        email,
        profileLink: countryCode ? await uniqueSlug(displayName, countryCode) : null,
      },
    });
  }

  // Replace the service list wholesale — PC owns this data, so a service the
  // owner removed there must disappear here. Bookings reference Service rows,
  // so only delete the ones nothing points at.
  const services = (body.services ?? []).map(s => s.trim()).filter(Boolean).slice(0, 30);
  if (services.length) {
    const current = await prisma.service.findMany({
      where: { expertId: expert.id },
      select: { id: true, name: true, bookings: { select: { id: true }, take: 1 } },
    });
    const keep = new Set(services);
    const removable = current.filter(s => !keep.has(s.name) && s.bookings.length === 0);
    if (removable.length) {
      await prisma.service.deleteMany({ where: { id: { in: removable.map(s => s.id) } } });
    }
    const existingNames = new Set(current.map(s => s.name));
    const toAdd = services.filter(s => !existingNames.has(s));
    if (toAdd.length) {
      await prisma.service.createMany({
        data: toAdd.map((name, i) => ({ expertId: expert.id, name, sortOrder: i })),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    expertId: expert.id,
    profileLink: expert.profileLink,
    created: !existing,
  });
}
