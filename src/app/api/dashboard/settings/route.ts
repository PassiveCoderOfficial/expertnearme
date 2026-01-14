// File: src/app/api/dashboard/settings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const setting = await prisma.setting.findFirst();
  return NextResponse.json(setting || { emailVerificationRequired: true });
}

export async function POST(req: Request) {
  const { emailVerificationRequired } = await req.json();

  const existing = await prisma.setting.findFirst();
  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: { emailVerificationRequired },
    });
  } else {
    await prisma.setting.create({ data: { emailVerificationRequired } });
  }

  return NextResponse.json({ ok: true });
}
