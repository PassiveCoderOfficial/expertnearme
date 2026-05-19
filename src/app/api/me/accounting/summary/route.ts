import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expert = await prisma.expert.findUnique({ where: { email: session.email } });
  if (!expert) return NextResponse.json({ error: 'Not an expert' }, { status: 403 });

  const book = await prisma.accountBook.findUnique({ where: { expertId: expert.id } });
  if (!book) return NextResponse.json({ totalIncome: 0, totalExpense: 0, netBalance: 0, byCategory: [], monthlyData: [] });

  const entries = await prisma.accountEntry.findMany({ where: { bookId: book.id } });
  const totalIncome = entries.filter(e => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // By-category breakdown
  const byCategoryMap: Record<string, number> = {};
  entries.forEach(e => {
    const cat = e.category || 'Uncategorized';
    byCategoryMap[cat] = (byCategoryMap[cat] || 0) + (e.type === 'CREDIT' ? e.amount : -e.amount);
  });
  const byCategory = Object.entries(byCategoryMap).map(([name, amount]) => ({ name, amount })).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  // Monthly data (last 12 months)
  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  entries.forEach(e => {
    const month = e.entryDate.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
    if (e.type === 'CREDIT') monthlyMap[month].income += e.amount;
    else monthlyMap[month].expense += e.amount;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, { income, expense }]) => ({ month, income, expense }));

  return NextResponse.json({ totalIncome, totalExpense, netBalance, byCategory, monthlyData });
}
