import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) },
    include: {
      expert: { select: { email: true, name: true, businessName: true } },
      client: { select: { id: true, name: true } },
      service: { select: { name: true } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the expert (via their user) or the client can update
  const expertUser = await prisma.user.findUnique({ where: { email: booking.expert.email } });
  const isExpert = expertUser?.id === session.userId;
  const isClient = booking.clientId === session.userId;
  const isAdmin  = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.role);
  if (!isExpert && !isClient && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.booking.update({ where: { id: Number(id) }, data: { status } });

  // Notify the other party
  const notifyUserId = isExpert ? booking.clientId : expertUser?.id;
  const expertName = booking.expert.businessName || booking.expert.name;
  if (notifyUserId) {
    const messages: Record<string, string> = {
      APPROVED:     isExpert ? `Your booking with ${expertName} has been approved!` : `Booking cancelled by ${session.email}`,
      DECLINED:     `Your booking with ${expertName} was declined.`,
      DONE:         `Your booking with ${expertName} is marked as complete.`,
      RESCHEDULED:  `Your booking with ${expertName} has been rescheduled.`,
    };
    await prisma.notification.create({
      data: {
        userId:  notifyUserId,
        title:   `Booking ${status}`,
        message: messages[status] || `Booking status updated to ${status}.`,
        type:    "booking",
        link:    "/dashboard/bookings",
      },
    });
  }

  return NextResponse.json({ booking: updated });
}
