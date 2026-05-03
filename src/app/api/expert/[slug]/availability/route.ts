import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expert/[slug]/availability?year=2026&month=4
// Returns booked slots and weekly availability for a given month
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const year  = parseInt(searchParams.get("year")  || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

    const expert = await prisma.expert.findFirst({
      where: { profileLink: slug },
      select: {
        id: true,
        allowBooking: true,
        blockSlotAfterBooking: true,
        urgentBooking: true,
        urgentFeePercent: true,
        availability: true,
        services: {
          where: { availableForBooking: true },
          select: { id: true, name: true, duration: true, rateUnit: true, rateType: true, description: true },
        },
      },
    });

    if (!expert || !expert.allowBooking) {
      return NextResponse.json({ error: "Booking not available" }, { status: 404 });
    }

    // Fetch bookings for this month to mark blocked slots
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd   = new Date(year, month, 1);

    const bookedSlots = expert.blockSlotAfterBooking
      ? await prisma.booking.findMany({
          where: {
            expertId: expert.id,
            scheduledAt: { gte: monthStart, lt: monthEnd },
            status: { notIn: ["DECLINED"] },
          },
          select: { scheduledAt: true, endsAt: true },
        })
      : [];

    return NextResponse.json({
      availability: expert.availability,
      bookedSlots,
      urgentBooking: expert.urgentBooking,
      urgentFeePercent: expert.urgentFeePercent,
      services: expert.services,
    });
  } catch (err) {
    console.error("GET /api/expert/[slug]/availability error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
