// File: src/app/api/categories/by-slug/[slug]/route.ts
// Public API: GET /api/categories/by-slug/[slug]
//
// Returns category details and a sanitized list of experts belonging to that category.
// Each expert includes `profileLink` so the frontend can link to `/${profileLink}`.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ParamsContext = { params: { slug: string } } | { params: Promise<{ slug: string }> };

async function resolveSlug(context: ParamsContext) {
  const { slug } = await Promise.resolve((context as any).params);
  if (!slug || typeof slug !== "string") throw new Error("Invalid slug");
  return slug;
}

export async function GET(_req: NextRequest, context: ParamsContext) {
  try {
    const slug = await resolveSlug(context);

    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, parentId: true, showOnHomepage: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Fetch expert-category links and include only the public-facing expert fields.
    // We explicitly select fields to avoid leaking internal or sensitive data.
    const links = await prisma.expertCategory.findMany({
      where: { categoryId: category.id },
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isBusiness: true,
            businessName: true,
            profileLink: true,
            shortDesc: true,
            profilePicture: true,
            coverPhoto: true,
            featured: true,
            createdAt: true,
          },
        },
      },
      orderBy: { expertId: "asc" }, // order by expertId (valid column on join table)
    });

    // Map to experts and dedupe by id (in case of duplicate join rows)
    const seen = new Set<number>();
    const experts = links
      .map((l) => l.expert)
      .filter((ex) => {
        if (!ex) return false;
        if (seen.has(ex.id)) return false;
        seen.add(ex.id);
        return true;
      });

    return NextResponse.json({ category, experts });
  } catch (err: any) {
    console.error("GET /api/categories/by-slug/[slug] error:", err);
    return NextResponse.json({ error: "Failed to fetch category experts" }, { status: 500 });
  }
}
