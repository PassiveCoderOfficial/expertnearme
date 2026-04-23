import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { slug } = await params;
    const { serviceId, scheduledAt, notes, isUrgent } = await req.json();

    if (!scheduledAt) return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });

    const expert = await prisma.expert.findFirst({
      where: { profileLink: slug },
      select: { id: true, allowBooking: true, blockSlotAfterBooking: true, urgentFeePercent: true },
    });

    if (!expert?.allowBooking) {
      return NextResponse.json({ error: "Booking not available for this expert" }, { status: 400 });
    }

    const service = serviceId
      ? await prisma.service.findFirst({ where: { id: Number(serviceId), expertId: expert.id, availableForBooking: true } })
      : null;

    const durationMins = service?.duration || 60;
    const start = new Date(scheduledAt);
    const end   = new Date(start.getTime() + durationMins * 60 * 1000);

    // Check for existing overlapping booking if slot-blocking is on
    if (expert.blockSlotAfterBooking) {
      const overlap = await prisma.booking.findFirst({
        where: {
          expertId: expert.id,
          status: { notIn: ["DECLINED"] },
          scheduledAt: { lt: end },
          endsAt:      { gt: start },
        },
      });
      if (overlap) return NextResponse.json({ error: "Time slot is already booked" }, { status: 409 });
    }

    const urgentFee = isUrgent ? (service ? 0 : 0) * (expert.urgentFeePercent / 100) : null;

    const booking = await prisma.booking.create({
      data: {
        expertId:    expert.id,
        clientId:    session.userId,
        serviceId:   service?.id || null,
        scheduledAt: start,
        endsAt:      end,
        notes:       notes || null,
        isUrgent:    !!isUrgent,
        urgentFee,
        status:      "PENDING",
      },
    });

    // Notify expert (find their user account by email)
    const expertUser = await prisma.user.findUnique({ where: { email: (await prisma.expert.findUnique({ where: { id: expert.id }, select: { email: true } }))!.email } });
    if (expertUser) {
      await prisma.notification.create({
        data: {
          userId:  expertUser.id,
          title:   "New Booking Request",
          message: `You have a new booking request${service ? ` for ${service.name}` : ""} on ${start.toLocaleDateString()}.`,
          type:    "booking",
          link:    "/dashboard/bookings",
        },
      });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/expert/[slug]/book error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
