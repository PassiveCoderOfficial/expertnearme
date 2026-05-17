import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function getExpert() {
  const session = await getSession();
  if (!session.authenticated) return null;
  return prisma.expert.findUnique({ where: { email: session.email }, select: { id: true } });
}

export async function GET() {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.expertAward.findMany({
    where: { expertId: expert.id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ awards: items });
}

export async function POST(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const item = await prisma.expertAward.create({
    data: {
      expertId: expert.id,
      title: String(body.title ?? '').trim(),
      issuer: body.issuer ? String(body.issuer).trim() : null,
      year: body.year ? Number(body.year) : null,
      description: body.description ? String(body.description).trim() : null,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await prisma.expertAward.updateMany({
    where: { id: Number(body.id), expertId: expert.id },
    data: {
      title: body.title ? String(body.title).trim() : undefined,
      issuer: body.issuer !== undefined ? (body.issuer || null) : undefined,
      year: body.year !== undefined ? (body.year ? Number(body.year) : null) : undefined,
      description: body.description !== undefined ? (body.description || null) : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  await prisma.expertAward.deleteMany({ where: { id, expertId: expert.id } });
  return NextResponse.json({ ok: true });
}
