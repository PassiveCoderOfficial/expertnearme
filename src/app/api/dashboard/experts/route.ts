// File: src/app/api/dashboard/experts/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const experts = await prisma.expert.findMany({
    include: { categories: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(experts);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.name || !data.email) {
    return NextResponse.json({ error: "Name and Email are required." }, { status: 400 });
  }

  const expert = await prisma.expert.create({ data });
  return NextResponse.json(expert);
}
