// File: src/app/api/categories/[id]/route.ts
// Public API: GET /api/categories/[id]  (read-only)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, parentId: true, showOnHomepage: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Optionally compute expert link count for the response
    const expertCount = await prisma.expertCategory.count({ where: { categoryId: id } });

    return NextResponse.json({ ...category, expertCount });
  } catch (err: any) {
    console.error("GET /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}
