import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function getExpert(session: { userId: number }) {
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } });
  if (!user) return null;
  return prisma.expert.findUnique({ where: { email: user.email }, select: { id: true } });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const source = searchParams.get('source');

  const leads = await prisma.lead.findMany({
    where: {
      expertId: expert.id,
      ...(status ? { status: status as any } : {}),
      ...(source ? { source: source as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const body = await req.json();
  const { name, email, phone, message, source, sourceUrl, notes } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      expertId: expert.id,
      name,
      email: email || null,
      phone: phone || null,
      message: message || null,
      source: source || 'MANUAL',
      sourceUrl: sourceUrl || null,
      notes: notes || null,
    },
  });
  return NextResponse.json({ lead }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const body = await req.json();
  const { id, status, notes } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.lead.findFirst({ where: { id: Number(id), expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const lead = await prisma.lead.update({
    where: { id: Number(id) },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });
  return NextResponse.json({ lead });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.lead.findFirst({ where: { id: Number(id), expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.lead.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
