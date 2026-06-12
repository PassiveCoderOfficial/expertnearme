import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — ExpertNear.Me',
  description: 'Insights, guides, and news for finding and hiring local experts.',
};

export const revalidate = 300;

async function getPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        altText: true,
        authorName: true,
        publishedAt: true,
        readingTimeMins: true,
        categoryTag: true,
        tags: true,
      },
    });
  } catch (err) {
    // DB can be unreachable during the build/prerender phase — ISR will
    // repopulate within `revalidate` seconds once deployed.
    console.error('[BlogIndex] failed to load posts:', err);
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero */}
      <section className="pt-12 pb-14 px-4 text-center bg-gradient-to-br from-slate-50 via-white to-orange-50/20 dark:from-transparent dark:via-transparent dark:to-transparent">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
          <BookOpen className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Our Blog</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          Insights & Resources
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Guides, tips, and news to help you find the right expert — or grow your practice.
        </p>
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 overflow-hidden hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg dark:hover:bg-slate-800/80 transition-all duration-200 shadow-sm dark:shadow-none"
              >
                {post.coverImage ? (
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={post.coverImage}
                      alt={post.altText || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center gap-3">
                    <img src="/logo.png" alt="ExpertNear.Me" className="h-10 w-auto opacity-20 dark:opacity-30" />
                    <span className="text-xs font-semibold text-slate-300 dark:text-slate-600 uppercase tracking-widest">ExpertNear.Me</span>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5">
                  {post.categoryTag && (
                    <span className="text-xs font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-2">
                      {post.categoryTag.replace(/-/g, ' ')}
                    </span>
                  )}

                  <h2 className="text-slate-900 dark:text-white font-semibold text-lg leading-snug mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/8 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.authorName}
                    </span>
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {post.readingTimeMins}m
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
