import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/guard";
// File: src/app/api/dashboard/bookings/route.ts
import { NextResponse } from "next/server";




export async function GET() {
  const gate = await requireRole();
  if (gate instanceof NextResponse) return gate;
  const bookings = await prisma.booking.findMany({
    include: { expert: true, client: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const gate = await requireRole();
  if (gate instanceof NextResponse) return gate;
  const data = await req.json();

  if (!data.expertId || !data.clientId || !data.scheduledAt) {
    return NextResponse.json({ error: "Expert, Client, and Date are required." }, { status: 400 });
  }

  const booking = await prisma.booking.create({ data });
  return NextResponse.json(booking);
}
