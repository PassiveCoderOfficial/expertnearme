// src/app/api/dashboard/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ParamsContext = { params: { id: string } } | { params: Promise<{ id: string }> };

async function resolveId(context: ParamsContext) {
  const { id: idParam } = await Promise.resolve((context as any).params);
  const id = Number(idParam);
  if (Number.isNaN(id)) throw new Error("Invalid id");
  return id;
}

// GET /api/dashboard/bookings/[id]
export async function GET(_req: NextRequest, context: ParamsContext): Promise<Response> {
  try {
    const id = await resolveId(context);

    const booking = await prisma.booking.findUnique({
      where: { id },
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
    if (err.message === "Invalid id") {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// PATCH /api/dashboard/bookings/[id]
export async function PATCH(req: NextRequest, context: ParamsContext): Promise<Response> {
  try {
    const id = await resolveId(context);
    const body = await req.json();

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /dashboard/bookings/[id] error:", err);
    if (err.message === "Invalid id") {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE /api/dashboard/bookings/[id]
export async function DELETE(_req: NextRequest, context: ParamsContext): Promise<Response> {
  try {
    const id = await resolveId(context);

    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /dashboard/bookings/[id] error:", err);
    if (err.message === "Invalid id") {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
