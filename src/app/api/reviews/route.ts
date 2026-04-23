import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/reviews?expertId=X&page=1&limit=10
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get("expertId");
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit    = Math.min(50, parseInt(searchParams.get("limit") || "10"));
  const skip     = (page - 1) * limit;

  const where = expertId ? { expertId: parseInt(expertId) } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, profile: { select: { avatar: true } } } },
        booking: { select: { id: true, scheduledAt: true, service: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  // Rating distribution
  const dist = await prisma.review.groupBy({
    by: ["rating"],
    where,
    _count: { id: true },
  });

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const d of dist) distribution[d.rating] = d._count.id;

  const avgRating = total > 0
    ? Object.entries(distribution).reduce((sum, [r, c]) => sum + Number(r) * c, 0) / total
    : null;

  return NextResponse.json({ reviews, total, page, limit, avgRating, distribution });
}

// POST /api/reviews — submit a review (buyer, after DONE booking)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { bookingId, rating, comment } = await req.json();
  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "bookingId and rating (1-5) are required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: Number(bookingId) },
    select: { id: true, expertId: true, clientId: true, status: true },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.clientId !== session.userId) return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  if (booking.status !== "DONE") return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 });

  // Prevent duplicate review for same booking by same client
  const existing = await prisma.review.findFirst({
    where: { bookingId: booking.id, clientId: session.userId },
  });
  if (existing) return NextResponse.json({ error: "You already reviewed this booking" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      expertId:  booking.expertId,
      clientId:  session.userId,
      rating:    Number(rating),
      comment:   comment?.trim() || null,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  // Notify the expert
  const expertUser = await prisma.user.findFirst({
    where: { email: (await prisma.expert.findUnique({ where: { id: booking.expertId }, select: { email: true } }))!.email },
    select: { id: true },
  });
  if (expertUser) {
    await prisma.notification.create({
      data: {
        userId:  expertUser.id,
        title:   "New Review",
        message: `${review.client.name} left you a ${rating}-star review.`,
        type:    "review",
        link:    "/dashboard/reviews",
      },
    });
  }

  return NextResponse.json({ review }, { status: 201 });
}
