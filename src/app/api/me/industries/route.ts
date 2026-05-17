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
  const items = await prisma.expertIndustry.findMany({ where: { expertId: expert.id } });
  return NextResponse.json({ industries: items });
}

export async function POST(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const name = String(body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const item = await prisma.expertIndustry.create({ data: { expertId: expert.id, name } });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  await prisma.expertIndustry.deleteMany({ where: { id, expertId: expert.id } });
  return NextResponse.json({ ok: true });
}
