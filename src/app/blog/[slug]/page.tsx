import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, metaTitle: true, metaDesc: true, ogImage: true, ogTitle: true, ogDesc: true, noIndex: true, canonicalUrl: true },
  });

  if (!post) return { title: 'Not Found' };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || undefined,
    robots: post.noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: {
      title: post.ogTitle || post.metaTitle || post.title,
      description: post.ogDesc || post.metaDesc || undefined,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'PUBLISHED' },
  });

  if (!post) notFound();

  prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-600 dark:hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.altText || post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center gap-3">
              <img src="/logo.png" alt="ExpertNear.Me" className="h-14 w-auto opacity-20 dark:opacity-25" />
              <span className="text-sm font-semibold text-slate-300 dark:text-slate-600 uppercase tracking-widest">ExpertNear.Me</span>
            </div>
          )}
        </div>

        <header className="mb-8">
          {post.categoryTag && (
            <span className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider">
              {post.categoryTag.replace(/-/g, ' ')}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-slate-500 dark:text-slate-300 text-lg mt-3 leading-relaxed">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.authorName}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTimeMins} min read
            </span>
          </div>
        </header>

        <article
          className="blog-content text-slate-600 dark:text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-100 dark:border-slate-700/50">
            {post.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
