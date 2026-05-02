import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function getExpert(userId: number) {
  return prisma.expert.findFirst({ where: { email: { equals: (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email } } });
}

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
  const portfolio = await prisma.portfolio.findMany({ where: { expertId: expert.id }, orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ portfolio });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const count = await prisma.portfolio.count({ where: { expertId: expert.id } });
  if (count >= 20) return NextResponse.json({ error: 'Max 20 portfolio items' }, { status: 400 });

  const body = await req.json();
  const item = await prisma.portfolio.create({
    data: {
      expertId:    expert.id,
      title:       body.title       ?? null,
      description: body.description ?? null,
      imageUrl:    body.imageUrl    ?? null,
      videoUrl:    body.videoUrl    ?? null,
      socialUrl:   body.socialUrl   ?? null,
      sortOrder:   count,
    },
  });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.portfolio.findFirst({ where: { id, expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const item = await prisma.portfolio.update({
    where: { id },
    data: {
      title:       'title'       in data ? data.title       : undefined,
      description: 'description' in data ? data.description : undefined,
      imageUrl:    'imageUrl'    in data ? data.imageUrl    : undefined,
      videoUrl:    'videoUrl'    in data ? data.videoUrl    : undefined,
      socialUrl:   'socialUrl'   in data ? data.socialUrl   : undefined,
      sortOrder:   'sortOrder'   in data ? data.sortOrder   : undefined,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpertBySession(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.portfolio.findFirst({ where: { id, expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.portfolio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
