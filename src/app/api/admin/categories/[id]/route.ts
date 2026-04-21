// File: src/app/api/admin/categories/[id]/route.ts
// Admin API: GET /api/admin/categories/:id  (optional admin read)
//            PATCH /api/admin/categories/:id (update) — admin only
//            DELETE /api/admin/categories/:id (delete) — admin only

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const category = await prisma.category.findUnique({ where: { id: numId } });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err: any) {
    console.error("GET /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id: numId },
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Block delete if experts are linked
    const linkCount = await prisma.expertCategory.count({ where: { categoryId: numId } });
    if (linkCount > 0) {
      return NextResponse.json({ error: "Cannot delete category: experts are linked" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/categories/[id] error:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
