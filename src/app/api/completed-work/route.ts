import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/completed-work?limit=12&cursor=&countryCode=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
  const cursor = searchParams.get("cursor") ? parseInt(searchParams.get("cursor")!) : undefined;
  const countryCode = searchParams.get("countryCode") || undefined;

  try {
    const items = await prisma.completedWork.findMany({
      where: {
        published: true,
        ...(countryCode ? { countryCode } : {}),
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            businessName: true,
            profileLink: true,
            profilePicture: true,
            verified: true,
            countryCode: true,
            categories: {
              take: 1,
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const nextCursor = items.length === limit ? items[items.length - 1].id : null;
    return NextResponse.json({ items, nextCursor });
  } catch (err) {
    console.error("[CompletedWork] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
