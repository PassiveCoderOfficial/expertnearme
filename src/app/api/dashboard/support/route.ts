import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MANAGER"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const type = searchParams.get("type") || undefined;

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(type ? { type: type as any } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ tickets });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status, priority, adminNote } = body;

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(adminNote !== undefined && { adminNote }),
    },
  });

  return NextResponse.json({ ticket: updated });
}
