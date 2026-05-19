import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const invoiceId = parseInt(id);

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, expertId: expert.id },
    include: { items: true, payments: true },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.invoicePayment.create({
      data: {
        invoiceId,
        amount: body.amount,
        method: body.method,
        reference: body.reference,
        paidAt,
        notes: body.notes,
      },
    });

    let book = await tx.accountBook.findUnique({ where: { expertId: expert.id } });
    if (!book) {
      book = await tx.accountBook.create({ data: { expertId: expert.id } });
    }

    const accountEntry = await tx.accountEntry.create({
      data: {
        bookId: book.id,
        type: 'CREDIT',
        amount: body.amount,
        description: `Payment for Invoice ${invoice.invoiceNumber} — ${invoice.clientName}`,
        reference: invoice.invoiceNumber,
        invoiceId,
        category: 'Client Invoice Payment',
        entryDate: paidAt,
      },
    });

    const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
    const discount = invoice.discount ?? 0;
    const taxRate = invoice.taxRate ?? 0;
    const tax = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + tax;
    const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0) + body.amount;

    let newStatus = invoice.status;
    if (totalPaid >= total) newStatus = 'PAID';
    else if (totalPaid > 0) newStatus = 'PARTIALLY_PAID';

    if (newStatus !== invoice.status) {
      await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });
    }

    return { payment, accountEntry, status: newStatus };
  });

  return NextResponse.json(result, { status: 201 });
}
