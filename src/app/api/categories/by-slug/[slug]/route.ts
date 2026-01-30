// File: src/app/api/categories/by-slug/[slug]/route.ts
// Public API: GET /api/categories/by-slug/[slug]

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

    // Find join rows and include the related expert (public-facing)
    const links = await prisma.expertCategory.findMany({
      where: { categoryId: category.id },
      include: { expert: true },
    });

    const experts = links.map((l) => l.expert);
    return NextResponse.json({ category, experts });
  } catch (err: any) {
    console.error("GET /api/categories/by-slug/[slug] error:", err);
    return NextResponse.json({ error: "Failed to fetch category experts" }, { status: 500 });
  }
}
