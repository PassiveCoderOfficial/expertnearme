// File: src/app/api/admin/categories/route.ts
// Admin API: GET /api/admin/categories  (list tree)
//            POST /api/admin/categories (create) — admin only

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  countryCode: string;
  parentId: number | null;
  showOnHomepage: boolean;
  children: CategoryNode[];
}

// Build tree helper
function buildTree(items: Array<{ id: number; name: string; slug: string; countryCode: string; parentId: number | null; showOnHomepage: boolean }>): CategoryNode[] {
  const byId: Record<number, CategoryNode> = {};
  items.forEach((c) => (byId[c.id] = { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  items.forEach((c) => {
    if (c.parentId) {
      byId[c.parentId]?.children.push(byId[c.id]);
    } else {
      roots.push(byId[c.id]);
    }
  });
  return roots;
}

export async function GET() {
  try {
    const rows = await prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, countryCode: true, parentId: true, showOnHomepage: true },
    });
    const tree = buildTree(rows);
    return NextResponse.json(tree);
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, slug, parentId, showOnHomepage, countryCode } = await req.json();
    if (!name || !slug || !countryCode) {
      return NextResponse.json({ error: "Name, slug, and country are required" }, { status: 400 });
    }

    const exists = await prisma.category.findUnique({ where: { countryCode_slug: { countryCode, slug } } });
    if (exists) {
      return NextResponse.json({ error: "Slug already exists in this country" }, { status: 409 });
    }

    let parent: number | null = null;
    if (parentId !== null && parentId !== undefined) {
      const parentCat = await prisma.category.findUnique({ where: { id: Number(parentId) } });
      if (!parentCat) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 404 });
      }
      parent = Number(parentId);
    }

    const category = await prisma.category.create({
      data: { 
        name, 
        slug, 
        parentId: parent, 
        showOnHomepage: Boolean(showOnHomepage),
        countryCode: countryCode || "us",
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/categories error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
