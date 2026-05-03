import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const BLOG_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MARKETER', 'SEO_EXPERT']);
const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN']);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.authenticated || !BLOG_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const post = await prisma.blogPost.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      ...(body.altText !== undefined && { altText: body.altText }),
      ...(body.authorName !== undefined && { authorName: body.authorName }),
      ...(body.authorAvatar !== undefined && { authorAvatar: body.authorAvatar }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.publishedAt !== undefined && { publishedAt: body.publishedAt ? new Date(body.publishedAt) : null }),
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
      ...(body.countryCode !== undefined && { countryCode: body.countryCode }),
      ...(body.categoryTag !== undefined && { categoryTag: body.categoryTag }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
      ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc }),
      ...(body.focusKeyword !== undefined && { focusKeyword: body.focusKeyword }),
      ...(body.canonicalUrl !== undefined && { canonicalUrl: body.canonicalUrl }),
      ...(body.ogImage !== undefined && { ogImage: body.ogImage }),
      ...(body.ogTitle !== undefined && { ogTitle: body.ogTitle }),
      ...(body.ogDesc !== undefined && { ogDesc: body.ogDesc }),
      ...(body.noIndex !== undefined && { noIndex: body.noIndex }),
      ...(body.readingTimeMins !== undefined && { readingTimeMins: body.readingTimeMins }),
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.authenticated || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
