// File: src/app/api/dashboard/categories/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.name || !data.slug) {
    return NextResponse.json({ error: "Name and Slug are required." }, { status: 400 });
  }

  const category = await prisma.category.create({ data });
  return NextResponse.json(category);
}
