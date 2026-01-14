// File: src/app/api/dashboard/reviews/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { expert: true, client: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.bookingId || !data.expertId || !data.clientId || !data.rating) {
    return NextResponse.json({ error: "Booking, Expert, Client, and Rating are required." }, { status: 400 });
  }

  const review = await prisma.review.create({ data });
  return NextResponse.json(review);
}
