import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/guard';

const ANALYTICS_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MARKETER'] as const;

export async function GET() {
  const gate = await requireRole(ANALYTICS_ROLES);
  if (gate instanceof NextResponse) return gate;

  try {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalExperts, verifiedExperts, foundingExperts,
      totalUsers, newUsers30,
      totalBookings, bookings30,
      totalReviews,
      waitlistCount,
      blogAgg,
      adAgg,
      activeCampaigns,
      expertsByCountry,
      topCategories,
      recentSignups,
    ] = await Promise.all([
      prisma.expert.count(),
      prisma.expert.count({ where: { verified: true } }),
      prisma.expert.count({ where: { foundingExpert: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since30 } } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: since30 } } }),
      prisma.review.count(),
      prisma.waitlist.count(),
      prisma.blogPost.aggregate({ _sum: { viewCount: true }, _count: true, where: { status: 'PUBLISHED' } }),
      prisma.adCampaign.aggregate({ _sum: { impressions: true, clicks: true } }),
      prisma.adCampaign.count({ where: { status: 'ACTIVE' } }),
      prisma.expert.groupBy({ by: ['countryCode'], _count: { _all: true }, orderBy: { _count: { countryCode: 'desc' } }, take: 10 }),
      prisma.expertCategory.groupBy({ by: ['categoryId'], _count: { _all: true }, orderBy: { _count: { categoryId: 'desc' } }, take: 8 }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    ]);

    const catIds = topCategories.map(c => c.categoryId);
    const catNames = catIds.length
      ? await prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } })
      : [];
    const catNameMap = Object.fromEntries(catNames.map(c => [c.id, c.name]));

    const impressions = adAgg._sum.impressions ?? 0;
    const clicks = adAgg._sum.clicks ?? 0;

    return NextResponse.json({
      experts: { total: totalExperts, verified: verifiedExperts, founding: foundingExperts, foundingTotal: 500 },
      users: { total: totalUsers, new30: newUsers30 },
      bookings: { total: totalBookings, new30: bookings30 },
      reviews: { total: totalReviews },
      waitlist: { total: waitlistCount },
      blog: { published: blogAgg._count, views: blogAgg._sum.viewCount ?? 0 },
      ads: { impressions, clicks, ctr: impressions > 0 ? (clicks / impressions) * 100 : 0, activeCampaigns },
      expertsByCountry: expertsByCountry.map(c => ({ country: c.countryCode ?? '—', count: c._count._all })),
      topCategories: topCategories.map(c => ({ name: catNameMap[c.categoryId] ?? `#${c.categoryId}`, count: c._count._all })),
      recentSignups,
    });
  } catch (err) {
    console.error('GET /api/admin/analytics error:', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
