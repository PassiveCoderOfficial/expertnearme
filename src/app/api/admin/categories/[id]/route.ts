// File: src/app/api/admin/categories/[id]/route.ts
// Admin API: GET /api/admin/categories/:id  (optional admin read)
//            PATCH /api/admin/categories/:id (update) — admin only
//            DELETE /api/admin/categories/:id (delete) — admin only

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err: any) {
    console.error("GET /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: ParamsContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    console.error("PATCH /api/admin/categories/[id] error:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: ParamsContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const id = await resolveId(context);

    // Block delete if experts are linked
    const linkCount = await prisma.expertCategory.count({ where: { categoryId: id } });
    if (linkCount > 0) {
      return NextResponse.json({ error: "Cannot delete category: experts are linked" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/categories/[id] error:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
