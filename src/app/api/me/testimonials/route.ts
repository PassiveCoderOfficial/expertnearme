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
  const items = await prisma.expertTestimonial.findMany({
    where: { expertId: expert.id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ testimonials: items });
}

export async function POST(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const item = await prisma.expertTestimonial.create({
    data: {
      expertId: expert.id,
      clientName: String(body.clientName ?? '').trim(),
      clientTitle: body.clientTitle ? String(body.clientTitle).trim() : null,
      clientCompany: body.clientCompany ? String(body.clientCompany).trim() : null,
      body: String(body.body ?? '').trim(),
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await prisma.expertTestimonial.updateMany({
    where: { id: Number(body.id), expertId: expert.id },
    data: {
      clientName: body.clientName ? String(body.clientName).trim() : undefined,
      clientTitle: body.clientTitle !== undefined ? (body.clientTitle || null) : undefined,
      clientCompany: body.clientCompany !== undefined ? (body.clientCompany || null) : undefined,
      body: body.body ? String(body.body).trim() : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  await prisma.expertTestimonial.deleteMany({ where: { id, expertId: expert.id } });
  return NextResponse.json({ ok: true });
}
