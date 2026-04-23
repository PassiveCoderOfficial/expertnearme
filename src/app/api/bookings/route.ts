import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const BOOKING_INCLUDE = {
  expert: { select: { id: true, name: true, businessName: true, profileLink: true, profilePicture: true, email: true } },
  client: { select: { id: true, name: true, email: true } },
  service: { select: { id: true, name: true, duration: true, rateUnit: true } },
} as const;

async function attachExpertUserId(bookings: any[]) {
  const emails = [...new Set(bookings.map(b => b.expert.email).filter(Boolean))];
  if (!emails.length) return bookings;
  const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } });
  const map = new Map(users.map(u => [u.email, u.id]));
  return bookings.map(b => ({ ...b, expert: { ...b.expert, userId: map.get(b.expert.email) ?? null } }));
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "buyer";

  if (role === "expert") {
    const expert = await prisma.expert.findFirst({ where: { email: session.email }, select: { id: true } });
    if (!expert) return NextResponse.json({ bookings: [] });
    const bookings = await prisma.booking.findMany({
      where: { expertId: expert.id },
      include: BOOKING_INCLUDE,
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json({ bookings: await attachExpertUserId(bookings) });
  }

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.userId },
    include: BOOKING_INCLUDE,
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ bookings: await attachExpertUserId(bookings) });
}
