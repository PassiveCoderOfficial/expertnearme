import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import CategoryGrid, { CategoryItem } from "@/components/CategoryGrid";
import { getCategoriesListData } from "@/lib/cache";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ countryCode: string }>;
}

export default async function CountryCategoriesPage({ params }: Props) {
  const { countryCode } = await params;
  const code = countryCode.toLowerCase();

  const { country, categories } = await getCategoriesListData(code);
  if (!country) notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${code}`} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{code.toUpperCase()}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-white">Categories</span>
        </div>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-2">Browse</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Categories in {code.toUpperCase()}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Find the right expert type and browse verified listings.</p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-14 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">No categories found for {code.toUpperCase()} yet.</p>
            <Link href="/for-experts" className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 text-sm transition-colors">
              Be the first to list here →
            </Link>
          </div>
        ) : (
          <CategoryGrid
            categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, expertCount: c._count.experts }))}
            countryCode={code}
            initialCount={20}
            batchSize={20}
          />
        )}
      </div>
    </div>
  );
}
