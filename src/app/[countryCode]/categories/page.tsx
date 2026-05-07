import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

interface Props {
  params: Promise<{ countryCode: string }>;
}

export default async function CountryCategoriesPage({ params }: Props) {
  const { countryCode } = await params;
  const code = countryCode.toLowerCase();

  const country = await prisma.country.findFirst({ where: { code, active: true } });
  if (!country) notFound();

  const categories = await prisma.category.findMany({
    where: { countryCode: code, active: true },
    include: { _count: { select: { experts: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white ">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-2">{code.toUpperCase()}</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Browse Categories</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Find the right expert type and browse verified listings.</p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            No categories found for this country yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${code}/categories/${cat.slug}`}
                className="rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-800/50 shadow-sm dark:shadow-none hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-md dark:hover:bg-slate-800/80 hover:-translate-y-0.5 p-5 text-center transition-all duration-200 group">
                <div className="text-3xl mb-3">{cat.icon || "🏢"}</div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cat.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{cat._count.experts} expert{cat._count.experts !== 1 ? "s" : ""}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
