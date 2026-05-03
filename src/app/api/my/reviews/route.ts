import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/my/reviews — returns reviews written by buyer, or received by expert
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "EXPERT") {
    const expert = await prisma.expert.findFirst({ where: { email: session.email }, select: { id: true } });
    if (!expert) return NextResponse.json({ reviews: [] });

    const reviews = await prisma.review.findMany({
      where: { expertId: expert.id },
      include: {
        client: { select: { id: true, name: true, profile: { select: { avatar: true } } } },
        booking: { select: { id: true, scheduledAt: true, service: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews, role: "expert" });
  }

  // Buyer — reviews they wrote
  const reviews = await prisma.review.findMany({
    where: { clientId: session.userId },
    include: {
      expert: { select: { id: true, name: true, businessName: true, profileLink: true, profilePicture: true } },
      booking: { select: { id: true, scheduledAt: true, service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews, role: "buyer" });
}
