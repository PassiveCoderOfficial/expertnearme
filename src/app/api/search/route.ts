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

    if (country) {
      // Filter experts that belong to categories with the given countryCode
      where.categories = {
        some: {
          category: {
            countryCode: country,
          },
        },
      };
    }

    if (category) {
      where.categories = {
        ...where.categories,
        some: {
          ...where.categories?.some,
          categoryId: category,
        },
      };
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { bio: { contains: q } },
        {
          categories: {
            some: {
              category: {
                name: { contains: q },
              },
            },
          },
        },
      ];
    }

    const experts = await prisma.expert.findMany({
      where,
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
