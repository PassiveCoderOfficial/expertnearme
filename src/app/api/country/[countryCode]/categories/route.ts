import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ countryCode: string }> }
) {
  try {
    const { countryCode: rawCountryCode } = await context.params;
    const countryCode = rawCountryCode.toLowerCase();

    const categories = await prisma.category.findMany({
      where: {
        countryCode,
        active: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        _count: {
          select: {
            experts: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      categories,
    });
  } catch (error) {
    console.error('Error fetching country categories:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch country categories' },
      { status: 500 }
    );
  }
}
