import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const BASE = 'https://expertnear.me';

export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // Static global pages
  urls.push(
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/for-experts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/founding-experts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  );

  // Countries
  const countries = await prisma.country.findMany({ where: { active: true } });
  for (const country of countries) {
    urls.push({
      url: `${BASE}/${country.code}`,
      lastModified: country.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
    urls.push({
      url: `${BASE}/${country.code}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Categories
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { countryCode: true, slug: true, updatedAt: true },
  });
  for (const cat of categories) {
    urls.push({
      url: `${BASE}/${cat.countryCode}/categories/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  // Expert profiles
  const experts = await prisma.expert.findMany({
    where: { profileLink: { not: null }, countryCode: { not: null } },
    select: { countryCode: true, profileLink: true, updatedAt: true },
  });
  for (const expert of experts) {
    if (!expert.profileLink || !expert.countryCode) continue;
    urls.push({
      url: `${BASE}/${expert.countryCode}/expert/${expert.profileLink}`,
      lastModified: expert.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Blog posts (published only)
  const blogPosts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, publishedAt: true, countryCode: true },
  });
  for (const post of blogPosts) {
    urls.push({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return urls;
}
