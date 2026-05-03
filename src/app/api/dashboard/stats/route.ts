import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.role;

  if (role === "ADMIN") {
    const [totalExperts, totalUsers, totalBookings, totalReviews, foundingExperts, recentExperts] =
      await Promise.all([
        prisma.expert.count(),
        prisma.user.count(),
        prisma.booking.count(),
        prisma.review.count(),
        prisma.expert.count({ where: { foundingExpert: true } }),
        prisma.expert.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, businessName: true, countryCode: true, verified: true, createdAt: true },
        }),
      ]);
    return NextResponse.json({ role: "ADMIN", totalExperts, totalUsers, totalBookings, totalReviews, foundingExperts, recentExperts });
  }

  if (role === "EXPERT") {
    const expert = await prisma.expert.findFirst({ where: { email: session.email } });
    if (!expert) return NextResponse.json({ role: "EXPERT", expert: null });
    const [bookings, reviews] = await Promise.all([
      prisma.booking.count({ where: { expertId: expert.id } }),
      prisma.review.findMany({ where: { expertId: expert.id }, select: { rating: true }, take: 100 }),
    ]);
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
    return NextResponse.json({ role: "EXPERT", expert, bookings, reviewCount: reviews.length, avgRating });
  }

  // USER
  const bookings = await prisma.booking.count({ where: { clientId: session.userId } });
  return NextResponse.json({ role: "USER", bookings });
}
