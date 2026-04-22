import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedExpert.findMany({
    where: { userId: session.id },
    include: {
      expert: {
        select: {
          id: true, name: true, businessName: true, profileLink: true,
          profilePicture: true, shortDesc: true, verified: true,
          featured: true, countryCode: true,
          categories: { include: { category: { select: { name: true } } } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ saved });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { expertId } = await req.json();
  if (!expertId) return NextResponse.json({ error: "expertId required" }, { status: 400 });

  const existing = await prisma.savedExpert.findUnique({
    where: { userId_expertId: { userId: session.id, expertId: Number(expertId) } },
  });

  if (existing) {
    await prisma.savedExpert.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedExpert.create({ data: { userId: session.id, expertId: Number(expertId) } });
  return NextResponse.json({ saved: true });
}
