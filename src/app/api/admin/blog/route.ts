import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const BLOG_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MARKETER', 'SEO_EXPERT']);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !BLOG_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;
  const where = status ? { status: status as any } : {};

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
      select: {
        id: true, title: true, slug: true, status: true, publishedAt: true,
        scheduledAt: true, countryCode: true, categoryTag: true, viewCount: true,
        readingTimeMins: true, coverImage: true, excerpt: true, createdAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !BLOG_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, slug, excerpt, content, coverImage, altText, authorName, authorAvatar,
    status, publishedAt, scheduledAt, countryCode, categoryTag, tags,
    metaTitle, metaDesc, focusKeyword, canonicalUrl, ogImage, ogTitle, ogDesc,
    noIndex, readingTimeMins,
  } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'title, slug, content required' }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title, slug, excerpt, content, coverImage, altText,
      authorName: authorName || 'ExpertNear.Me Team',
      authorAvatar,
      status: status || 'DRAFT',
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      countryCode: countryCode || null,
      categoryTag: categoryTag || null,
      tags: tags || null,
      metaTitle, metaDesc, focusKeyword, canonicalUrl,
      ogImage, ogTitle, ogDesc,
      noIndex: noIndex ?? false,
      readingTimeMins: readingTimeMins || 5,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
