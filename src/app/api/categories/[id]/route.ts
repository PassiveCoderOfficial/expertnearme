// File: src/app/api/categories/[id]/route.ts
// Public API: GET /api/categories/[id]  (read-only)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: numId },
      select: { id: true, name: true, slug: true, parentId: true, showOnHomepage: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Optionally compute expert link count for the response
    const expertCount = await prisma.expertCategory.count({ where: { categoryId: numId } });

    return NextResponse.json({ ...category, expertCount });
  } catch (err: any) {
    console.error("GET /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}
