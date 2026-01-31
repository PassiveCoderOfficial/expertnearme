// File: src/app/api/dashboard/experts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, getUniqueSlug } from "@/lib/filename";

type IncomingService = {
  name?: string;
  image?: string | null;
  description?: string | null;
  rateUnit?: string | null;
};

type IncomingPortfolio = {
  imageUrl?: string | null;
  videoUrl?: string | null;
  socialUrl?: string | null;
};

type CreateBody = {
  name?: string;
  email?: string;
  phone?: string | null;
  whatsapp?: string | null;
  isBusiness?: boolean;
  businessName?: string | null;
  contactPerson?: string | null;
  officeAddress?: string | null;
  webAddress?: string | null;
  mapLocation?: string | null;
  profilePicture?: string | null;
  coverPhoto?: string | null;
  shortDesc?: string | null;
  featured?: boolean;
  services?: IncomingService[] | unknown;
  portfolio?: IncomingPortfolio[] | unknown;
  categoryIds?: (string | number)[] | unknown;
};

export async function GET() {
  try {
    const experts = await prisma.expert.findMany({
      include: {
        categories: { include: { category: true } },
        services: true,
        portfolio: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(experts);
  } catch (err: any) {
    console.error("GET /api/dashboard/experts error:", err);
    return NextResponse.json({ error: "Failed to fetch experts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as CreateBody;

    // Basic validation
    if (!raw?.name || !raw?.email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Normalize nested arrays safely
    const services = Array.isArray(raw.services) ? (raw.services as IncomingService[]) : [];
    const portfolio = Array.isArray(raw.portfolio) ? (raw.portfolio as IncomingPortfolio[]) : [];

    // Normalize categoryIds to number[] and filter invalid entries
    const categoryIds: number[] = Array.isArray(raw.categoryIds)
      ? (raw.categoryIds as (string | number)[])
          .map((v) => Number(v))
          .filter((n): n is number => Number.isFinite(n))
      : [];

    // --- Generate profileLink server-side to ensure every expert has a slug ---
    const baseForSlug = (
      raw.businessName ||
      raw.name ||
      (raw.email || "").split("@")[0] ||
      `expert-${Date.now()}`
    ).toString().trim();

    const baseSlug = slugify(baseForSlug);

    // Fetch existing slugs to ensure uniqueness
    const existing = await prisma.expert.findMany({ select: { profileLink: true } });
    const existingSlugs = existing.map((e) => (e.profileLink || "").toLowerCase()).filter(Boolean);

    const profileLink = getUniqueSlug(baseSlug, existingSlugs);

    // Create expert with nested services and portfolio
    const created = await prisma.expert.create({
      data: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone ?? null,
        whatsapp: raw.whatsapp ?? null,
        isBusiness: !!raw.isBusiness,
        businessName: raw.businessName ?? null,
        contactPerson: raw.contactPerson ?? null,
        officeAddress: raw.officeAddress ?? null,
        webAddress: raw.webAddress ?? null,
        mapLocation: raw.mapLocation ?? null,
        profilePicture: raw.profilePicture ?? null,
        coverPhoto: raw.coverPhoto ?? null,
        shortDesc: raw.shortDesc ?? null,
        featured: !!raw.featured,
        profileLink,
        services: {
          create: services.map((s) => ({
            name: s.name ?? "",
            image: s.image ?? null,
            description: s.description ?? null,
            rateUnit: s.rateUnit ?? null,
          })),
        },
        portfolio: {
          create: portfolio.map((p) => ({
            imageUrl: p.imageUrl ?? null,
            videoUrl: p.videoUrl ?? null,
            socialUrl: p.socialUrl ?? null,
          })),
        },
      },
    });

    // Link categories via join table (skip duplicates)
    if (categoryIds.length > 0) {
      const payload = categoryIds.map((cid) => ({ expertId: created.id, categoryId: cid }));
      if (payload.length > 0) {
        await prisma.expertCategory.createMany({
          data: payload,
          skipDuplicates: true,
        });
      }
    }

    // Return the created expert with relations
    const expert = await prisma.expert.findUnique({
      where: { id: created.id },
      include: {
        categories: { include: { category: true } },
        services: true,
        portfolio: true,
      },
    });

    return NextResponse.json(expert, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/dashboard/experts error:", err);
    // Handle unique constraint on email
    if (err?.code === "P2002" && Array.isArray(err?.meta?.target) && err.meta.target.includes("email")) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create expert" }, { status: 500 });
  }
}
