// File: src/app/api/dashboard/experts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, getUniqueSlug } from "@/lib/filename";

type ParamsContext = { params: { id: string } } | { params: Promise<{ id: string }> };

async function resolveId(context: ParamsContext) {
  const { id: idParam } = await Promise.resolve((context as any).params);
  const id = Number(idParam);
  if (Number.isNaN(id)) throw new Error("Invalid id");
  return id;
}

export async function GET(_req: NextRequest, context: ParamsContext) {
  try {
    const id = await resolveId(context);
    const expert = await prisma.expert.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        services: true,
        portfolio: true,
        reviews: true,
      },
    });
    if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    return NextResponse.json(expert);
  } catch (err: any) {
    console.error("GET /api/dashboard/experts/[id] error:", err);
    if (err.message === "Invalid id") {
      return NextResponse.json({ error: "Invalid expert id" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch expert" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: ParamsContext) {
  try {
    const id = await resolveId(context);
    const body = await req.json();

    // Load current expert to know existing slug
    const current = await prisma.expert.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

    // Prepare update payload (only allow certain fields)
    const payload: any = {};
    const allowed = [
      "name",
      "email",
      "phone",
      "whatsapp",
      "isBusiness",
      "businessName",
      "contactPerson",
      "officeAddress",
      "webAddress",
      "mapLocation",
      "profilePicture",
      "coverPhoto",
      "shortDesc",
      "featured",
    ];
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, k)) payload[k] = body[k];
    }

    // --- Slug handling: manual override or conditional regeneration ---
    let profileLink = current.profileLink || "";

    // If admin provided a manual slug, use it (slugified) and ensure uniqueness
    if (body.profileLink) {
      const manual = slugify(String(body.profileLink));
      const existing = await prisma.expert.findMany({ select: { profileLink: true } });
      const existingSlugs = existing.map((e) => (e.profileLink || "").toLowerCase()).filter(Boolean);
      profileLink = getUniqueSlug(manual, existingSlugs, current.profileLink || null);
    } else {
      // Regenerate only if base changed and admin didn't manually edit slug
      const baseChanged =
        (body.businessName && body.businessName !== current.businessName) ||
        (body.name && body.name !== current.name);

      if (baseChanged) {
        const base = (body.businessName || body.name || current.businessName || current.name || `expert-${id}`).toString();
        const baseSlug = slugify(base);
        const existing = await prisma.expert.findMany({ select: { profileLink: true } });
        const existingSlugs = existing.map((e) => (e.profileLink || "").toLowerCase()).filter(Boolean);
        profileLink = getUniqueSlug(baseSlug, existingSlugs, current.profileLink || null);
      }
    }

    // Attach profileLink to payload so it's updated when needed
    payload.profileLink = profileLink;

    // Update expert
    const updated = await prisma.expert.update({
      where: { id },
      data: payload,
    });

    // Optionally update categories/services/portfolio if provided
    if (Array.isArray(body.categoryIds)) {
      // Replace categories: delete existing links then create new ones
      await prisma.expertCategory.deleteMany({ where: { expertId: id } });
      const catPayload = body.categoryIds
        .map((c: any) => Number(c))
        .filter((c: number) => Number.isFinite(c))
        .map((categoryId: number) => ({ expertId: id, categoryId }));
      if (catPayload.length > 0) {
        await prisma.expertCategory.createMany({ data: catPayload, skipDuplicates: true });
      }
    }

    if (Array.isArray(body.services)) {
      // Simple approach: delete existing services and recreate
      await prisma.service.deleteMany({ where: { expertId: id } });
      const svcPayload = body.services.map((s: any) => ({
        expertId: id,
        name: s.name,
        image: s.image ?? null,
        description: s.description ?? null,
        rateUnit: s.rateUnit ?? null,
      }));
      if (svcPayload.length > 0) await prisma.service.createMany({ data: svcPayload });
    }

    if (Array.isArray(body.portfolio)) {
      await prisma.portfolio.deleteMany({ where: { expertId: id } });
      const pfPayload = body.portfolio.map((p: any) => ({
        expertId: id,
        imageUrl: p.imageUrl ?? null,
        videoUrl: p.videoUrl ?? null,
        socialUrl: p.socialUrl ?? null,
      }));
      if (pfPayload.length > 0) await prisma.portfolio.createMany({ data: pfPayload });
    }

    const result = await prisma.expert.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        services: true,
        portfolio: true,
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("PATCH /api/dashboard/experts/[id] error:", err);
    if (err.message === "Invalid id") {
      return NextResponse.json({ error: "Invalid expert id" }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update expert" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: ParamsContext) {
  try {
    const id = await resolveId(context);
    await prisma.expert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/dashboard/experts/[id] error:", err);
    if (err.message === "Invalid id") {
      return NextResponse.json({ error: "Invalid expert id" }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete expert" }, { status: 500 });
  }
}
