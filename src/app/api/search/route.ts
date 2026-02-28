import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.toLowerCase().trim();
    const country = searchParams.get('country')?.toLowerCase().trim();
    const category = searchParams.get('category')?.toLowerCase().trim();
    const serviceType = searchParams.get('serviceType')?.toLowerCase().trim();

    const where: any = {
      active: true,
      verified: true,
    };

    if (country) {
      where.countryCode = country;
    }

    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      };
    }

    if (serviceType) {
      where.serviceTypes = {
        some: {
          id: serviceType,
        },
      };
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { bio: { contains: q } },
        { categories: { some: { name: { contains: q } } } },
      ];
    }

    const experts = await prisma.expert.findMany({
      where,
      include: {
        categories: true,
        serviceTypes: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    const results = experts.map((expert) => {
      const ratings = expert.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      return {
        id: expert.id,
        name: expert.name,
        bio: expert.bio,
        avatar: expert.avatar,
        email: expert.email,
        phone: expert.phone,
        countryCode: expert.countryCode,
        rating: avgRating,
        reviewCount: expert.reviews.length,
        categories: expert.categories.map((c) => ({ id: c.id, name: c.name })),
        serviceTypes: expert.serviceTypes.map((st) => ({ id: st.id, name: st.name })),
      };
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', success: false },
      { status: 500 }
    );
  }
}