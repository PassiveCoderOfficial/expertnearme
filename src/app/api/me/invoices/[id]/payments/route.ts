import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(id), expertId: expert.id },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  const [payment, accountEntry] = await Promise.all([
    prisma.invoicePayment.create({
      data: {
        invoiceId: invoice.id,
        amount: body.amount,
        method: body.method,
        reference: body.reference,
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
        notes: body.notes,
      },
    }),
    // Auto-create accounting entry
    (async () => {
      let book = await prisma.accountBook.findUnique({ where: { expertId: expert.id } });
      if (!book) {
        book = await prisma.accountBook.create({ data: { expertId: expert.id } });
      }
      return prisma.accountEntry.create({
        data: {
          bookId: book.id,
          type: 'CREDIT',
          amount: body.amount,
          description: `Payment for Invoice ${invoice.invoiceNumber} — ${invoice.clientName}`,
          reference: invoice.invoiceNumber,
          invoiceId: invoice.id,
          category: 'Client Invoice Payment',
          entryDate: body.paidAt ? new Date(body.paidAt) : new Date(),
        },
      });
    })(),
  ]);

  return NextResponse.json({ payment, accountEntry }, { status: 201 });
}
