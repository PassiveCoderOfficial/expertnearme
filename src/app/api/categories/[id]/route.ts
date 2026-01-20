// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ParamsContext = { params: { id: string } } | { params: Promise<{ id: string }> };

async function resolveId(context: ParamsContext) {
  const { id: idParam } = await Promise.resolve((context as any).params);
  const id = Number(idParam);
  if (Number.isNaN(id)) throw new Error("Invalid id");
  return id;
}

// GET /api/categories/[id]
export async function GET(_req: NextRequest, context: ParamsContext): Promise<Response> {
  try {
    const id = await resolveId(context);

    const category = await prisma.category.findUnique({
      where: { id },
      // include relations you actually need here
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Optionally compute expert link count for the response
    const expertCount = await prisma.expertCategory.count({
      where: { categoryId: id },
    });

    return NextResponse.json({ ...category, expertCount });
  } catch (err: any) {
    console.error("GET /categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PATCH /api/categories/[id]
export async function PATCH(req: NextRequest, context: ParamsContext): Promise<Response> {
  try {
    const id = await resolveId(context);
    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        showOnHomepage: body.showOnHomepage,
        parentId: body.parentId ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /categories/[id] error:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(_req: NextRequest, context: ParamsContext): Promise<Response> {
  try {
    const id = await resolveId(context);

    // Block delete if experts are linked (count join rows)
    const linkCount = await prisma.expertCategory.count({
      where: { categoryId: id },
    });

    if (linkCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category: experts are linked" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /categories/[id] error:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
