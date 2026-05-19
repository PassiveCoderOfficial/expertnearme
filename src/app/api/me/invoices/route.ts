import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = { expertId: expert.id };
  if (status) where.status = status;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        status: true,
        currency: true,
        dueDate: true,
        taxRate: true,
        discount: true,
        createdAt: true,
        items: { select: { amount: true } },
        payments: { select: { amount: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({
    invoices: invoices.map(inv => {
      const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
      const discount = inv.discount ?? 0;
      const taxRate = inv.taxRate ?? 0;
      const tax = (subtotal - discount) * (taxRate / 100);
      const totalAmount = subtotal - discount + tax;
      const paidAmount = inv.payments.reduce((s, p) => s + p.amount, 0);
      return {
        ...inv,
        totalAmount,
        paidAmount,
      };
    }),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const body = await req.json();
  const year = new Date().getFullYear();
  const seq = await prisma.invoice.count({ where: { expertId: expert.id, createdAt: { gte: new Date(`${year}-01-01`) } } });

  const items = Array.isArray(body.items) ? body.items : [];

  const invoice = await prisma.invoice.create({
    data: {
      expertId: expert.id,
      invoiceNumber: `INV-${year}-${String(seq + 1).padStart(5, '0')}`,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientAddress: body.clientAddress,
      clientPhone: body.clientPhone,
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      currency: body.currency || 'USD',
      taxRate: body.taxRate || 0,
      discount: body.discount || 0,
      notes: body.notes,
      fromName: body.fromName,
      fromAddress: body.fromAddress,
      fromEmail: body.fromEmail,
      fromPhone: body.fromPhone,
      logoUrl: body.logoUrl,
      items: items.length > 0 ? {
        create: items.map((it: any, idx: number) => ({
          description: it.description || '',
          quantity: it.quantity || 0,
          unitPrice: it.unitPrice || 0,
          amount: (it.quantity || 0) * (it.unitPrice || 0),
          sortOrder: idx,
        })),
      } : undefined,
    },
    include: { items: true, payments: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
