import { prisma } from "@/lib/db";
// File: src/app/api/dashboard/auditlogs/route.ts
import { NextResponse } from "next/server";




export async function GET() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true, role: true } } },
  });
  return NextResponse.json(logs);
}
