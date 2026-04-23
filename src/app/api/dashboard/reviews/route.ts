import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Admin view — all reviews
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (!ADMIN_ROLES.has(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reviews = await prisma.review.findMany({
    include: {
      expert: { select: { id: true, name: true, businessName: true, profileLink: true } },
      client: { select: { id: true, name: true, email: true } },
      booking: { select: { id: true, scheduledAt: true, service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, reviews });
}
