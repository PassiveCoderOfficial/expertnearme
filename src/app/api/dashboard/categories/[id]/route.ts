// File: src/app/api/dashboard/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
