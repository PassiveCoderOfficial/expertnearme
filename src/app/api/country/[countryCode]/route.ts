import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ countryCode: string }> }
) {
  try {
    const { countryCode: rawCountryCode } = await context.params;
    const countryCode = rawCountryCode.toLowerCase();
    
    // Fetch country data
    const country = await prisma.country.findUnique({
      where: { code: countryCode }
    });

    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      country: {
        code: country.code,
        name: country.name,
        flagEmoji: country.flagEmoji,
      }
    });
  } catch (error: any) {
    console.error('Error fetching country:', error?.message ?? error);
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch country data' }, { status: 500 });
  }
}