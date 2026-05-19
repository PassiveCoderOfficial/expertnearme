import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(id), expertId: expert.id },
    include: { items: true, payments: true },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(id), expertId: expert.id },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      clientName: body.clientName ?? invoice.clientName,
      clientEmail: body.clientEmail ?? invoice.clientEmail,
      clientAddress: body.clientAddress ?? invoice.clientAddress,
      clientPhone: body.clientPhone ?? invoice.clientPhone,
      dueDate: body.dueDate ? new Date(body.dueDate) : invoice.dueDate,
      status: body.status ?? invoice.status,
      currency: body.currency ?? invoice.currency,
      taxRate: body.taxRate ?? invoice.taxRate,
      discount: body.discount ?? invoice.discount,
      notes: body.notes ?? invoice.notes,
      fromName: body.fromName ?? invoice.fromName,
      fromAddress: body.fromAddress ?? invoice.fromAddress,
      fromEmail: body.fromEmail ?? invoice.fromEmail,
      fromPhone: body.fromPhone ?? invoice.fromPhone,
      logoUrl: body.logoUrl ?? invoice.logoUrl,
    },
    include: { items: true, payments: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(id), expertId: expert.id },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (invoice.status !== 'DRAFT') return NextResponse.json({ error: 'Can only delete drafts' }, { status: 400 });

  await prisma.invoice.delete({ where: { id: invoice.id } });
  return NextResponse.json({ success: true });
}
