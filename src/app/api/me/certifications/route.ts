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
  const items = await prisma.expertCertification.findMany({
    where: { expertId: expert.id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ certifications: items });
}

export async function POST(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const item = await prisma.expertCertification.create({
    data: {
      expertId: expert.id,
      name: String(body.name ?? '').trim(),
      issuer: body.issuer ? String(body.issuer).trim() : null,
      year: body.year ? Number(body.year) : null,
      credentialUrl: body.credentialUrl ? String(body.credentialUrl).trim() : null,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const item = await prisma.expertCertification.updateMany({
    where: { id: Number(body.id), expertId: expert.id },
    data: {
      name: body.name ? String(body.name).trim() : undefined,
      issuer: body.issuer !== undefined ? (body.issuer ? String(body.issuer).trim() : null) : undefined,
      year: body.year !== undefined ? (body.year ? Number(body.year) : null) : undefined,
      credentialUrl: body.credentialUrl !== undefined ? (body.credentialUrl ? String(body.credentialUrl).trim() : null) : undefined,
    },
  });
  return NextResponse.json({ ok: true, count: item.count });
}

export async function DELETE(req: NextRequest) {
  const expert = await getExpert();
  if (!expert) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  await prisma.expertCertification.deleteMany({ where: { id, expertId: expert.id } });
  return NextResponse.json({ ok: true });
}
