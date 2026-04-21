// File: src/app/api/experts/by-slug/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ParamsContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: ParamsContext) {
  try {
    const { slug } = await context.params;
    
    const expert = await prisma.expert.findUnique({
      where: { profileLink: slug },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        services: true,
        portfolio: true,
        reviews: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        bookings: {
          where: {
            status: 'DONE'
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating = expert.reviews.length > 0
      ? expert.reviews.reduce((sum, r) => sum + r.rating, 0) / expert.reviews.length
      : 0;

    // Count completed bookings
    const completedBookings = expert.bookings.length;

    return NextResponse.json({
      ...expert,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: expert.reviews.length,
      completedBookings,
      bookings: undefined // Remove from response
    });
  } catch (err: any) {
    console.error("GET /api/experts/by-slug/[slug] error:", err);
    return NextResponse.json({ error: "Failed to fetch expert" }, { status: 500 });
  }
}
