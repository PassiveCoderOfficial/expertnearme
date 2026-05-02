import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white pt-16">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-orange-400 mb-2">{code.toUpperCase()}</p>
          <h1 className="text-3xl font-bold text-white">Browse Categories</h1>
          <p className="text-slate-400 mt-2 text-sm">Find the right expert type and browse verified listings.</p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500 text-sm">
            No categories found for this country yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${code}/categories/${cat.slug}`}
                className="rounded-2xl border border-white/8 bg-slate-800/50 hover:border-orange-500/30 hover:bg-slate-800/80 p-5 text-center transition-colors group">
                <div className="text-3xl mb-3">{cat.icon || "🏢"}</div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{cat.name}</p>
                <p className="text-xs text-slate-500 mt-1">{cat._count.experts} experts</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
