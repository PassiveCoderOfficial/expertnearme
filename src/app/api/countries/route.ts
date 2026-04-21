import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { active: true },
      select: { code: true, name: true, flagEmoji: true, currency: true, timezone: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(countries);
  } catch (err) {
    console.error('GET /api/countries error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
