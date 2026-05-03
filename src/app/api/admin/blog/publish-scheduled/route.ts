import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Vercel Cron hits GET /api/admin/blog/publish-scheduled every 90 minutes.
// Vercel automatically injects Authorization: Bearer <CRON_SECRET>.
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const result = await prisma.blogPost.updateMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: now },
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: now,
    },
  });

  return NextResponse.json({ published: result.count, at: now.toISOString() });
}

// Also allow manual POST from admin dashboard button (uses session auth instead)
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const isVercelCron = auth === `Bearer ${process.env.CRON_SECRET}`;

  if (!isVercelCron) {
    // Fall back to session check for manual admin trigger
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    if (!session?.authenticated || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const result = await prisma.blogPost.updateMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
    data: { status: 'PUBLISHED', publishedAt: now },
  });

  return NextResponse.json({ published: result.count, at: now.toISOString() });
}
