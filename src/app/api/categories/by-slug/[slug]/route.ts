/**
 * src/app/api/categories/by-slug/[slug]/route.ts
 *
 * Purpose:
 * --------
 * Return a single category by slug with its linked providers.
 *
 * Response example:
 * {
 *   id: 3,
 *   name: "IT",
 *   slug: "it",
 *   providers: [
 *     { id: 10, name: "Muhammad Waliur Rahman", email: "passivecoder.com@gmail.com", phone: "01678669699" }
 *   ]
 * }
 *
 * Notes:
 * ------
 * - Uses ProviderCategory join table to fetch providers.
 * - If category not found, returns 404 JSON.
 * - Ensures providers is always an array.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const links = await prisma.providerCategory.findMany({
      where: { categoryId: category.id },
      include: { provider: true },
    });

    const providers = links.map((l) => ({
      id: l.provider.id,
      name: l.provider.name,
      email: l.provider.email,
      phone: l.provider.phone ?? null,
      isBusiness: l.provider.isBusiness,
    }));

    return NextResponse.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      providers,
    });
  } catch (err) {
    console.error("GET /api/categories/by-slug/[slug] error:", err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}
