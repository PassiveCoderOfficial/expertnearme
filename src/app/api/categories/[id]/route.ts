/**
 * File: src/app/api/categories/[id]/route.ts
 *
 * Purpose:
 * --------
 * Handle UPDATE (PUT) and DELETE for a single Category via `/api/categories/[id]`.
 *
 * Enhancements:
 * -------------
 * - Added support for `showOnHomepage` toggle so categories can be marked
 *   for display on the homepage.
 *
 * Notes:
 * ------
 * - Keeps all your existing validation: slug uniqueness, parent cycle prevention,
 *   safe delete rules.
 * - PrismaClient instantiated here for simplicity; consider using a shared singleton
 *   (e.g. `src/lib/db.ts`) in production.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * PUT /api/categories/[id]
 *
 * Body:
 * {
 *   "name": string,
 *   "slug": string,
 *   "parentId": number | null,
 *   "showOnHomepage": boolean
 * }
 */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  try {
    const { name, slug, parentId, showOnHomepage } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Ensure slug is unique
    const existingWithSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingWithSlug && existingWithSlug.id !== id) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    // Parent validation
    let newParentId: number | null = null;
    const parentProvided = parentId !== null && parentId !== undefined;
    if (parentProvided) {
      const pid = Number(parentId);
      if (!Number.isFinite(pid) || pid <= 0) {
        return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
      }
      if (pid === id) {
        return NextResponse.json(
          { error: "A category cannot be its own parent" },
          { status: 400 }
        );
      }

      const parentCat = await prisma.category.findUnique({ where: { id: pid } });
      if (!parentCat) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 }
        );
      }

      // Cycle guard
      const allCats = await prisma.category.findMany({
        select: { id: true, parentId: true },
      });
      const descendants = new Set<number>();
      const stack = [id];
      while (stack.length) {
        const current = stack.pop()!;
        for (const c of allCats) {
          if (c.parentId === current) {
            if (!descendants.has(c.id)) {
              descendants.add(c.id);
              stack.push(c.id);
            }
          }
        }
      }
      if (descendants.has(pid)) {
        return NextResponse.json(
          { error: "Cannot set a child as the parent (cycle)" },
          { status: 400 }
        );
      }

      newParentId = pid;
    }

    // ✅ Update category including showOnHomepage
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: newParentId,
        showOnHomepage: Boolean(showOnHomepage),
      },
    });

    return NextResponse.json(category);
  } catch (err: any) {
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 *
 * Behavior:
 * - Blocks delete if the category has children
 * - Blocks delete if the category is linked to providers
 * - Deletes the category if safe
 */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  try {
    // Block delete if category has children
    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete a category that has child categories" },
        { status: 400 }
      );
    }

    // Block delete if providers are linked
    const linkCount = await prisma.providerCategory.count({
      where: { categoryId: id },
    });
    if (linkCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete a category that is linked to providers" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
