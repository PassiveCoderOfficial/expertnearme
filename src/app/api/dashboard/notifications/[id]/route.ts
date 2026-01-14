// File: src/app/api/dashboard/notifications/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  return NextResponse.json(notification);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
