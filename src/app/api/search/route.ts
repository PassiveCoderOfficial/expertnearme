// File: src/app/api/search/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ sponsored: null, providers: [], categories: [] });
    }

    // Categories: match anywhere in name
    const categories = await prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, slug: true },
    });

    // Sponsored provider: must be featured AND match the query (name or category name)
    const sponsored = await prisma.provider.findFirst({
      where: {
        featured: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          {
            categories: {
              some: { category: { name: { contains: q, mode: "insensitive" } } },
            },
          },
        ],
      },
      select: { id: true, name: true, isBusiness: true, featured: true },
      orderBy: { name: "asc" },
    });

    // Regular providers: match query, exclude sponsored id if present
    const providers = await prisma.provider.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          {
            categories: {
              some: { category: { name: { contains: q, mode: "insensitive" } } },
            },
          },
        ],
        ...(sponsored ? { NOT: { id: sponsored.id } } : {}),
      },
      select: { id: true, name: true, isBusiness: true, featured: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      take: 9, // 1 sponsored + up to 9 regular = max 10 rows
    });

    return NextResponse.json({ sponsored, providers, categories });
  } catch (err) {
    console.error("Search API failed:", err);
    return NextResponse.json({ sponsored: null, providers: [], categories: [] }, { status: 500 });
  }
}
