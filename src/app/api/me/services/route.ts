import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function getExpertBySession(session: { userId: number }) {
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } });
  if (!user) return null;
  return prisma.expert.findUnique({ where: { email: user.email } });
}

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });
  const services = await prisma.service.findMany({ where: { expertId: expert.id }, orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const count = await prisma.service.count({ where: { expertId: expert.id } });
  if (count >= 20) return NextResponse.json({ error: 'Max 20 services' }, { status: 400 });

  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: 'Service name required' }, { status: 400 });

  const service = await prisma.service.create({
    data: {
      expertId:    expert.id,
      name:        body.name.trim(),
      description: body.description ?? null,
      rateUnit:    body.rateUnit    ?? null,
      price:       body.price       != null ? Number(body.price) : null,
      image:       body.image       ?? null,
      sortOrder:   count,
    },
  });
  return NextResponse.json({ service });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.service.findFirst({ where: { id, expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const service = await prisma.service.update({
    where: { id },
    data: {
      name:        'name'        in data ? data.name        : undefined,
      description: 'description' in data ? data.description : undefined,
      rateUnit:    'rateUnit'    in data ? data.rateUnit    : undefined,
      price:       'price'       in data ? (data.price != null ? Number(data.price) : null) : undefined,
      image:       'image'       in data ? data.image       : undefined,
      sortOrder:   'sortOrder'   in data ? data.sortOrder   : undefined,
    },
  });
  return NextResponse.json({ service });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.service.findFirst({ where: { id, expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
