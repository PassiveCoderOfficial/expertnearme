import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findFirst({
      where: {
        slug,
        active: true
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const experts = await prisma.expert.findMany({
      where: {
        verified: true,
        categories: {
          some: {
            categoryId: category.id
          }
        }
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedExperts = experts.map(expert => ({
      id: expert.id,
      name: expert.name,
      shortDesc: expert.shortDesc,
      phone: expert.phone,
      email: expert.email,
      officeAddress: expert.officeAddress,
      latitude: expert.latitude,
      longitude: expert.longitude,
      profilePicture: expert.profilePicture,
      verified: expert.verified,
      featured: expert.featured,
      createdAt: expert.createdAt,
      categories: expert.categories.map(c => ({
        category: c.category
      }))
    }));

    return NextResponse.json(formattedExperts);
  } catch (error) {
    console.error('Error fetching experts by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experts' },
      { status: 500 }
    );
  }
}
