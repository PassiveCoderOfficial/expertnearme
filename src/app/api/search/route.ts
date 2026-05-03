import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.toLowerCase().trim();
    const country = searchParams.get('country')?.toLowerCase().trim();
    const category = searchParams.get('category')?.toLowerCase().trim();
    // serviceType parameter is ignored for now (not in schema)

    const where: any = {
      verified: true,
    };

  const [expertResults, categoryResults] = await Promise.all([
    prisma.expert.findMany({
      where: {
        ...(country ? { countryCode: country } : {}),
        OR: [
          { name: { contains: q } },
          { businessName: { contains: q } },
          { shortDesc: { contains: q } },
          { categories: { some: { category: { name: { contains: q } } } } },
        ],
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        services: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        featured: 'desc',
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
        avatar: expert.profilePicture || undefined,
        email: expert.email,
        phone: expert.phone || undefined,
        rating: avgRating,
        reviewCount: expert.reviews.length,
        categories: expert.categories.map((ec) => ({
          id: ec.category.id,
          name: ec.category.name,
        })),
        services: expert.services.map((svc) => ({
          id: svc.id,
          name: svc.name,
          description: svc.description,
        })),
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
