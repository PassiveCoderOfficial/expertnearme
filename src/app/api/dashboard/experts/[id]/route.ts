// File: src/app/api/admin/experts/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.expert.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
