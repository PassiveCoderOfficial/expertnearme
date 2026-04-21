import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const experts = await prisma.expert.findMany({
      where: { foundingExpert: true },
      select: {
        id: true,
        name: true,
        businessName: true,
        profileLink: true,
        countryCode: true,
        profilePicture: true,
        shortDesc: true,
        foundingExpertSince: true,
        categories: {
          take: 1,
          include: { category: { select: { name: true } } },
        },
      },
      orderBy: { foundingExpertSince: 'asc' },
    });

    return NextResponse.json({ ok: true, experts });
  } catch (error) {
    console.error('Error fetching founding experts:', error);
    return NextResponse.json({ error: 'Failed to fetch founding experts' }, { status: 500 });
  }
}
