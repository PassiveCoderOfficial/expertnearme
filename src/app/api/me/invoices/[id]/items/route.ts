import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(id), expertId: expert.id },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const item = await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice.id,
      description: body.description,
      quantity: body.quantity || 1,
      unitPrice: body.unitPrice,
      amount: (body.quantity || 1) * body.unitPrice,
      sortOrder: body.sortOrder || 0,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const item = await prisma.invoiceItem.findFirst({
    where: { id: body.itemId, invoice: { expertId: expert.id } },
  });

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.invoiceItem.update({
    where: { id: item.id },
    data: {
      description: body.description ?? item.description,
      quantity: body.quantity ?? item.quantity,
      unitPrice: body.unitPrice ?? item.unitPrice,
      amount: ((body.quantity ?? item.quantity) * (body.unitPrice ?? item.unitPrice)),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const body = await req.json();
  const item = await prisma.invoiceItem.findFirst({
    where: { id: body.itemId, invoice: { expertId: expert.id } },
  });

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.invoiceItem.delete({ where: { id: item.id } });
  return NextResponse.json({ success: true });
}
