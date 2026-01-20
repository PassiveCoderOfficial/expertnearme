// File: src/app/api/dashboard/notifications/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type MaybeAsyncParams = { id: string } | Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  context: { params: MaybeAsyncParams }
): Promise<Response> {
  try {
    const { id } = await Promise.resolve(context.params);
    const body = await request.json();

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        message: body.message,
        read: body.read,
      },
      select: {
        id: true,
        createdAt: true,
        userId: true,
        title: true,
        message: true,
        read: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/dashboard/notifications/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
