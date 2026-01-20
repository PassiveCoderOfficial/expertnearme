import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper type: params can be plain or a Promise
type MaybeAsyncParams = { id: string } | Promise<{ id: string }>;

// GET handler
export async function GET(
  request: NextRequest,
  context: { params: MaybeAsyncParams }
): Promise<Response> {
  try {
    const { id } = await Promise.resolve(context.params);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  context: { params: MaybeAsyncParams }
): Promise<Response> {
  try {
    const { id } = await Promise.resolve(context.params);

    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
