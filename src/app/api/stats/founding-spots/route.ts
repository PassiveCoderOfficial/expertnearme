import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const TOTAL_SPOTS = 500;

export async function GET() {
  try {
    const taken = await prisma.expert.count({
      where: { foundingExpert: true },
    });

    return NextResponse.json({
      ok: true,
      taken,
      total: TOTAL_SPOTS,
      remaining: Math.max(0, TOTAL_SPOTS - taken),
    });
  } catch (error) {
    console.error('Error fetching founding spots:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
