import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/my/reviewable-bookings — DONE bookings the buyer hasn't reviewed yet
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doneBookings = await prisma.booking.findMany({
    where: { clientId: session.userId, status: "DONE" },
    include: {
      expert: { select: { id: true, name: true, businessName: true, profileLink: true, profilePicture: true } },
      service: { select: { name: true } },
      reviews: { where: { clientId: session.userId }, select: { id: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const reviewable = doneBookings.filter(b => b.reviews.length === 0);
  return NextResponse.json({ bookings: reviewable });
}
