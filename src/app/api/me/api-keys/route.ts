import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createHash, randomBytes } from 'crypto';

async function getExpert(session: { userId: number }) {
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } });
  if (!user) return null;
  return prisma.expert.findUnique({ where: { email: user.email }, select: { id: true } });
}

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const keys = await prisma.expertApiKey.findMany({
    where: { expertId: expert.id },
    select: { id: true, keyPrefix: true, label: true, scopes: true, active: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const count = await prisma.expertApiKey.count({ where: { expertId: expert.id, active: true } });
  if (count >= 5) return NextResponse.json({ error: 'Max 5 active API keys' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { label } = body;

  const rawKey = 'enm_' + randomBytes(32).toString('hex');
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);

  const record = await prisma.expertApiKey.create({
    data: {
      expertId: expert.id,
      keyHash,
      keyPrefix,
      label: label || null,
    },
  });

  // Return the raw key ONCE — not stored, show to user now
  return NextResponse.json({
    key: rawKey,
    id: record.id,
    keyPrefix,
    label: record.label,
    createdAt: record.createdAt,
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: 'No expert profile' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await prisma.expertApiKey.findFirst({ where: { id: Number(id), expertId: expert.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.expertApiKey.update({ where: { id: Number(id) }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
