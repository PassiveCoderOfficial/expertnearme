// src/app/api/categories/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// GET /api/categories → fetch full tree (top-level + children)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    const tree = buildTree(categories);
    return NextResponse.json(tree);
  } catch (err: any) {
    console.error('GET /categories error:', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories → add a new category (optionally under a parent)
export async function POST(req: Request) {
  try {
    const { name, slug, parentId } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    }

    // Ensure unique slug
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Validate parent if provided
    let parent: number | null = null;
    if (parentId !== null && parentId !== undefined) {
      const parentCat = await prisma.category.findUnique({ where: { id: Number(parentId) } });
      if (!parentCat) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
      parent = Number(parentId);
    }

    const category = await prisma.category.create({
      data: { name, slug, parentId: parent },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    console.error('POST /categories error:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
