import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/expert-availability — get own availability
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expert = await prisma.expert.findFirst({
    where: { email: session.email },
    select: {
      id: true, allowBooking: true, blockSlotAfterBooking: true,
      urgentBooking: true, urgentFeePercent: true,
      availability: { orderBy: { dayOfWeek: "asc" } },
      services: {
        select: { id: true, name: true, availableForBooking: true, duration: true, rateType: true, rateUnit: true },
      },
    },
  });

  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });
  return NextResponse.json(expert);
}

// PUT /api/expert-availability — replace entire availability config
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expert = await prisma.expert.findFirst({ where: { email: session.email }, select: { id: true } });
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const { allowBooking, blockSlotAfterBooking, urgentBooking, urgentFeePercent, slots } = await req.json();

  await prisma.$transaction([
    prisma.expert.update({
      where: { id: expert.id },
      data: {
        allowBooking:          !!allowBooking,
        blockSlotAfterBooking: blockSlotAfterBooking !== false,
        urgentBooking:         !!urgentBooking,
        urgentFeePercent:      Number(urgentFeePercent) || 50,
      },
    }),
    prisma.expertAvailability.deleteMany({ where: { expertId: expert.id } }),
    ...(Array.isArray(slots) && slots.length > 0
      ? [prisma.expertAvailability.createMany({
          data: slots.map((s: { dayOfWeek: number; startTime: string; endTime: string }) => ({
            expertId: expert.id,
            dayOfWeek: Number(s.dayOfWeek),
            startTime: s.startTime,
            endTime:   s.endTime,
          })),
        })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
