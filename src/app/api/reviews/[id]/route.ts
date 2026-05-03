import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/reviews/[id] — client edits their review (within 7 days)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id: Number(id) } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  const isAdmin = ADMIN_ROLES.has(session.role);
  const isOwner = review.clientId === session.userId;

  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (isOwner && !isAdmin) {
    const age = Date.now() - new Date(review.createdAt).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Reviews can only be edited within 7 days" }, { status: 400 });
    }
  }

  const { rating, comment } = await req.json();
  const updated = await prisma.review.update({
    where: { id: Number(id) },
    data: {
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(comment !== undefined && { comment: comment?.trim() || null }),
    },
  });

  return NextResponse.json({ review: updated });
}

// DELETE /api/reviews/[id] — admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (!ADMIN_ROLES.has(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.review.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
