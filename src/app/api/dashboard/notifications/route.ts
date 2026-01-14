// File: src/app/api/dashboard/notifications/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const userId = 1; // 🔥 Replace with session userId
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const { userId, title, message } = await req.json();

  if (!userId || !title || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: { userId, title, message },
  });

  return NextResponse.json(notification);
}
