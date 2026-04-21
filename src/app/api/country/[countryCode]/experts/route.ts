import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ countryCode: string }> }
) {
  try {
    const { countryCode: rawCountryCode } = await context.params;
    const countryCode = rawCountryCode.toLowerCase();
    
    // Fetch experts in this country
    const experts = await prisma.expert.findMany({
      where: { 
        countryCode: countryCode,
        verified: true 
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        reviews: true
      },
      orderBy: { createdAt: "desc" },
      take: 50 // Limit for performance
    });

    return NextResponse.json({ 
      ok: true, 
      experts 
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json({ error: 'Failed to fetch experts data' }, { status: 500 });
  }
}