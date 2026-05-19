import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  let book = await prisma.accountBook.findUnique({ where: { expertId: expert.id } });
  if (!book) {
    book = await prisma.accountBook.create({ data: { expertId: expert.id } });
  }

  const recentEntries = await prisma.accountEntry.findMany({
    where: { bookId: book.id },
    orderBy: { entryDate: 'desc' },
    take: 10,
  });

  return NextResponse.json({ book, recentEntries });
}
