import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const book = await prisma.accountBook.findUnique({ where: { expertId: expert.id } });
  if (!book) return NextResponse.json({ entries: [] });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = { bookId: book.id };
  if (type) where.type = type;
  if (category) where.category = category;
  if (from) where.entryDate = { gte: new Date(from) };
  if (to) where.entryDate = { ...where.entryDate, lte: new Date(to) };

  const [entries, total] = await Promise.all([
    prisma.accountEntry.findMany({
      where,
      orderBy: { entryDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.accountEntry.count({ where }),
  ]);

  return NextResponse.json({ entries, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  let book = await prisma.accountBook.findUnique({ where: { expertId: expert.id } });
  if (!book) {
    book = await prisma.accountBook.create({ data: { expertId: expert.id } });
  }

  const body = await req.json();
  const entry = await prisma.accountEntry.create({
    data: {
      bookId: book.id,
      type: body.type,
      amount: body.amount,
      category: body.category,
      description: body.description,
      reference: body.reference,
      entryDate: body.entryDate ? new Date(body.entryDate) : new Date(),
      invoiceId: body.invoiceId,
      attachmentUrl: body.attachmentUrl,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
