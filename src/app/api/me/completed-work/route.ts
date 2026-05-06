import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function getExpert(email: string) {
  return prisma.expert.findUnique({ where: { email }, select: { id: true, countryCode: true } });
}

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expert = await getExpert(session.email);
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const items = await prisma.completedWork.findMany({
    where: { expertId: expert.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expert = await getExpert(session.email);
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const count = await prisma.completedWork.count({ where: { expertId: expert.id } });
  if (count >= 50) return NextResponse.json({ error: "Max 50 completed work posts" }, { status: 400 });

  const body = await req.json();
  const { title, description, imageUrl, videoUrl, tags } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const item = await prisma.completedWork.create({
    data: {
      expertId: expert.id,
      countryCode: expert.countryCode,
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      videoUrl: videoUrl?.trim() || null,
      tags: tags?.trim() || null,
      published: true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expert = await getExpert(session.email);
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const body = await req.json();
  const { id, title, description, imageUrl, videoUrl, tags, published } = body;

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const existing = await prisma.completedWork.findFirst({ where: { id, expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.completedWork.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      ...(videoUrl !== undefined && { videoUrl: videoUrl?.trim() || null }),
      ...(tags !== undefined && { tags: tags?.trim() || null }),
      ...(published !== undefined && { published }),
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expert = await getExpert(session.email);
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const existing = await prisma.completedWork.findFirst({ where: { id, expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.completedWork.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
