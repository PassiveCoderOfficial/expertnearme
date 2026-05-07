import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckCircle, MapPin, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completed Work — ExpertNear.Me",
  description: "Browse recently completed projects by verified experts on ExpertNear.Me. Real work, real results.",
};

export const revalidate = 300;

export default async function CompletedWorkPage() {
  const items = await prisma.completedWork.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      expert: {
        select: {
          id: true,
          name: true,
          businessName: true,
          profileLink: true,
          profilePicture: true,
          verified: true,
          countryCode: true,
          categories: {
            take: 1,
            include: { category: { select: { name: true } } },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-orange-500 mb-2 font-semibold">Live Updates</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Completed Work</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-base leading-relaxed">
            Real projects completed by verified experts on ExpertNear.Me. Updated continuously as experts post their latest work.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-20 text-center text-slate-400 dark:text-slate-500">
            No completed work posted yet. Experts — post your first project!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const expert = item.expert;
              const displayName = expert.businessName || expert.name;
              const category = expert.categories[0]?.category.name;
              const profileHref = expert.countryCode && expert.profileLink
                ? `/${expert.countryCode}/expert/${expert.profileLink}`
                : null;

              return (
                <article
                  key={item.id}
                  className="group rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 overflow-hidden hover:border-orange-200 dark:hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none flex flex-col"
                >
                  {item.imageUrl ? (
                    <div className="w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-orange-500/10 to-amber-500/5 dark:from-orange-500/15 dark:to-amber-500/8 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-orange-400/40" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold text-slate-800 dark:text-white text-base mb-2 line-clamp-2 leading-snug">
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-3 flex-1">
                        {item.description}
                      </p>
                    )}

                    {item.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.split(",").slice(0, 4).map((tag) => (
                          <span key={tag} className="text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-500/15 px-2 py-0.5 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expert info */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/6 flex items-center gap-3">
                      {expert.profilePicture ? (
                        <img src={expert.profilePicture} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {profileHref ? (
                          <Link href={profileHref} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate block">
                            {displayName}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{displayName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {expert.verified && (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {category && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">{category}</span>
                          )}
                          {expert.countryCode && (
                            <span className="flex items-center gap-0.5 text-xs text-slate-400 dark:text-slate-500">
                              <MapPin className="w-3 h-3" />{expert.countryCode.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.videoUrl && (
                        <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" title="Watch video" className="shrink-0 text-slate-400 hover:text-orange-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
