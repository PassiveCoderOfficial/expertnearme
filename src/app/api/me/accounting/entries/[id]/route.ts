import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const entry = await prisma.accountEntry.findFirst({
    where: { id: parseInt(id), book: { expertId: expert.id } },
  });

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.accountEntry.update({
    where: { id: entry.id },
    data: {
      type: body.type ?? entry.type,
      amount: body.amount ?? entry.amount,
      category: body.category ?? entry.category,
      description: body.description ?? entry.description,
      reference: body.reference ?? entry.reference,
      entryDate: body.entryDate ? new Date(body.entryDate) : entry.entryDate,
      attachmentUrl: body.attachmentUrl ?? entry.attachmentUrl,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const entry = await prisma.accountEntry.findFirst({
    where: { id: parseInt(id), book: { expertId: expert.id } },
  });

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.accountEntry.delete({ where: { id: entry.id } });
  return NextResponse.json({ success: true });
}
