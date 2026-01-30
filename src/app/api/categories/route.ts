// File: src/app/api/categories/route.ts
// Public API: GET /api/categories  (read-only, returns nested tree)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // use shared prisma client

// Build a nested tree from flat categories
function buildTree(items: any[]) {
  const byId: Record<number, any> = {};
  items.forEach((c) => (byId[c.id] = { ...c, children: [] }));
  const roots: any[] = [];
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
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        showOnHomepage: true,
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    const tree = buildTree(categories);
    return NextResponse.json(tree);
  } catch (err: any) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
