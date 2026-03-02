import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: numId },
      include: {
        expert: true,
        client: true,
        reviews: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err: any) {
    console.error("GET /dashboard/bookings/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.booking.update({
      where: { id: numId },
      data: {
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /dashboard/bookings/[id] error:", err);
    if (err.message === "Invalid booking id") {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    await prisma.booking.delete({ where: { id: numId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /dashboard/bookings/[id] error:", err);
    if (err.message === "Invalid booking id") {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
