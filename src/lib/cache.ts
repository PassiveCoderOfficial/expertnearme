import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const ONE_HOUR = 3600;

export const getCountryPageData = unstable_cache(
  async (code: string) => {
    const [country, expertsRaw, categories, reviewAgg] = await Promise.all([
      prisma.country.findFirst({ where: { code, active: true } }),
      prisma.expert.findMany({
        where: { countryCode: code, verified: true },
        select: {
          id: true, name: true, businessName: true, profileLink: true,
          profilePicture: true, shortDesc: true, verified: true,
          featured: true, foundingExpert: true, mapFeatured: true,
          latitude: true, longitude: true,
          _count: { select: { reviews: true } },
          categories: {
            select: { category: { select: { id: true, name: true, icon: true, color: true } } },
          },
        },
        orderBy: [{ featured: 'desc' }, { foundingExpert: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.category.findMany({
        where: { countryCode: code, active: true },
        select: { id: true, name: true, slug: true, icon: true, _count: { select: { experts: true } } },
        orderBy: [{ experts: { _count: 'desc' } }, { name: 'asc' }],
      }),
      prisma.review.aggregate({
        where: { expert: { countryCode: code } },
        _avg: { rating: true },
      }),
    ]);

    const expertIds = expertsRaw.map(e => e.id);
    const ratingsRaw = expertIds.length > 0 ? await prisma.review.groupBy({
      by: ['expertId'],
      where: { expertId: { in: expertIds } },
      _avg: { rating: true },
    }) : [];
    const ratingMap = new Map(ratingsRaw.map(r => [r.expertId, r._avg.rating]));
    const experts = expertsRaw.map(e => ({
      ...e,
      reviews: ratingMap.get(e.id) != null ? [{ rating: ratingMap.get(e.id)! }] : [],
    }));

    return { country, experts, categories, reviewAgg };
  },
  ['country-page-data'],
  { revalidate: ONE_HOUR, tags: ['country'] }
);

export const getExpertProfileData = unstable_cache(
  async (slug: string, countryCode: string) => {
    const expert = await prisma.expert.findFirst({
      where: { profileLink: slug, countryCode },
      include: {
        categories:     { include: { category: true } },
        services:       { include: { category: true }, orderBy: { sortOrder: 'asc' } },
        portfolio:      { orderBy: { sortOrder: 'asc' } },
        reviews: {
          include: { client: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        certifications: { orderBy: { sortOrder: 'asc' } },
        skills:         true,
        testimonials:   { orderBy: { sortOrder: 'asc' } },
        industries:     true,
        awards:         { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!expert) return null;

    const categoryIds = expert.categories.map(c => c.categoryId);

    const [expertUser, expertCompletedWork, nearbyRaw] = await Promise.all([
      prisma.user.findUnique({ where: { email: expert.email }, select: { id: true } }).catch(() => null),
      prisma.completedWork.findMany({
        where: { expertId: expert.id, published: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      }).catch(() => []),
      prisma.expert.findMany({
        where: {
          countryCode, verified: true, id: { not: expert.id },
          latitude: { not: null }, longitude: { not: null },
          categories: { some: { categoryId: { in: categoryIds } } },
        },
        select: {
          id: true, name: true, businessName: true, profileLink: true,
          latitude: true, longitude: true, verified: true, featured: true,
          mapFeatured: true, shortDesc: true,
          categories: { select: { category: { select: { name: true, icon: true, color: true } } }, take: 2 },
        },
        orderBy: [{ mapFeatured: "desc" }, { featured: "desc" }],
        take: 12,
      }).catch(() => []),
    ]);

    return { expert, expertUser, expertCompletedWork, nearbyRaw };
  },
  ['expert-profile-data'],
  { revalidate: ONE_HOUR, tags: ['expert'] }
);

export const getCategoryPageData = unstable_cache(
  async (countryCode: string, slug: string) => {
    const [category, expertCategories] = await Promise.all([
      prisma.category.findFirst({
        where: { slug, countryCode, active: true },
        select: {
          id: true, name: true, slug: true, icon: true, description: true,
          _count: { select: { experts: true } },
        },
      }),
      prisma.expertCategory.findMany({
        where: {
          category: { slug, countryCode, active: true },
          expert: { countryCode, verified: true },
        },
        select: {
          expert: {
            select: {
              id: true, name: true, businessName: true, profilePicture: true,
              shortDesc: true, serviceTitle: true, verified: true,
              foundingExpert: true, featured: true, mapFeatured: true,
              latitude: true, longitude: true, profileLink: true,
              availabilityStatus: true, yearsOfExperience: true,
              startingRate: true, startingRateUnit: true,
              _count: { select: { reviews: true } },
              categories: {
                select: { category: { select: { name: true, icon: true, color: true } } },
                take: 3,
              },
            },
          },
        },
        orderBy: { expert: { featured: "desc" } },
      }),
    ]);

    if (!category) return null;

    const expertIds = expertCategories.map(({ expert }) => expert.id);
    const ratingAgg = expertIds.length > 0 ? await prisma.review.groupBy({
      by: ['expertId'],
      where: { expertId: { in: expertIds } },
      _avg: { rating: true },
    }) : [];
    const ratingMap = new Map(ratingAgg.map(r => [r.expertId, r._avg.rating]));

    return { category, expertCategories, ratingMap };
  },
  ['category-page-data'],
  { revalidate: ONE_HOUR, tags: ['category'] }
);

export const getCategoriesListData = unstable_cache(
  async (code: string) => {
    const [country, categories] = await Promise.all([
      prisma.country.findFirst({ where: { code, active: true } }),
      prisma.category.findMany({
        where: { countryCode: code, active: true },
        select: { id: true, name: true, slug: true, icon: true, _count: { select: { experts: true } } },
        orderBy: [{ experts: { _count: 'desc' } }, { name: 'asc' }],
      }),
    ]);
    return { country, categories };
  },
  ['categories-list-data'],
  { revalidate: ONE_HOUR, tags: ['category'] }
);
