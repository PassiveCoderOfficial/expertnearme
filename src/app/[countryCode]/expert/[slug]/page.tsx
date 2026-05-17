import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Star, MapPin, Phone, Globe, Mail, CheckCircle, Award, Crown,
  MessageCircle, Pencil, Linkedin, Instagram, Twitter, Facebook,
  Clock, Languages, Briefcase, DollarSign, Users, Video,
  ExternalLink, Shield, Trophy, Building2, Quote, Tag,
  Zap, Calendar, TrendingUp, Youtube,
} from "lucide-react";
import type { Metadata } from "next";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";
import AdFeaturedExperts from "@/components/ads/AdFeaturedExperts";
import BookingWidget from "@/components/BookingWidget";
import MessageButton from "@/components/MessageButton";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";

export const revalidate = 3600;

interface ExpertProfilePageProps {
  params: Promise<{ slug: string; countryCode: string }>;
}

export async function generateMetadata({ params }: ExpertProfilePageProps): Promise<Metadata> {
  try {
    const { slug, countryCode } = await params;
    const expert = await prisma.expert.findFirst({
      where: { profileLink: slug, countryCode },
      select: { name: true, businessName: true, shortDesc: true, serviceTitle: true },
    });
    if (!expert) return { title: "Expert Not Found — ExpertNear.Me" };
    const displayName = expert.businessName || expert.name;
    const subtitle = expert.serviceTitle ? ` — ${expert.serviceTitle}` : '';
    return {
      title: `${displayName}${subtitle} — ExpertNear.Me`,
      description: expert.shortDesc ?? undefined,
    };
  } catch {
    return { title: "ExpertNear.Me" };
  }
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVAILABILITY_CONFIG = {
  AVAILABLE: { label: 'Available', color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/25', bg: 'bg-green-50 dark:bg-green-500/15' },
  AWAY:      { label: 'Away',      color: 'bg-yellow-400', textColor: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/25', bg: 'bg-yellow-50 dark:bg-yellow-500/15' },
  BUSY:      { label: 'Busy',      color: 'bg-red-500',   textColor: 'text-red-600 dark:text-red-400',    border: 'border-red-200 dark:border-red-500/25',    bg: 'bg-red-50 dark:bg-red-500/15'   },
  VACATION:  { label: 'On Vacation', color: 'bg-blue-400', textColor: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/25',  bg: 'bg-blue-50 dark:bg-blue-500/15' },
} as const;

export default async function ExpertProfilePage({ params }: ExpertProfilePageProps) {
  const { slug, countryCode } = await params;

  try {
    // Fetch expert + session in parallel (session doesn't need expert data)
    const [expert, session] = await Promise.all([
      prisma.expert.findFirst({
        where: { profileLink: slug, countryCode },
        include: {
          categories:     { include: { category: true } },
          services:       { include: { category: true }, orderBy: { sortOrder: 'asc' } },
          portfolio:      { orderBy: { sortOrder: 'asc' } },
          reviews: {
            include: { client: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
          },
          certifications: { orderBy: { sortOrder: 'asc' } },
          skills:         true,
          testimonials:   { orderBy: { sortOrder: 'asc' } },
          industries:     true,
          awards:         { orderBy: { sortOrder: 'asc' } },
        },
      }),
      getSession(),
    ]);

    if (!expert) notFound();

    const categoryIds = expert.categories.map(c => c.categoryId);

    // All dependent queries in parallel
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
        include: {
          categories: { include: { category: { select: { name: true, icon: true, color: true } } } },
        },
        orderBy: [{ mapFeatured: "desc" }, { featured: "desc" }],
        take: 20,
      }).catch(() => []),
    ]);

    const isOwner = session.authenticated && session.email === expert.email;
    const displayName = expert.businessName || expert.name;

    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of expert.reviews) ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
    const avgRating = expert.reviews.length > 0
      ? expert.reviews.reduce((s, r) => s + r.rating, 0) / expert.reviews.length
      : null;

    const currentExpertPin: MapExpert | null = (expert.latitude && expert.longitude) ? {
      id: expert.id, name: displayName,
      profileLink: expert.profileLink || String(expert.id),
      latitude: expert.latitude, longitude: expert.longitude,
      verified: expert.verified, featured: expert.featured,
      mapFeatured: expert.mapFeatured, shortDesc: expert.shortDesc,
      categories: expert.categories.map(c => ({ name: c.category.name, icon: null, color: null })),
    } : null;

    const nearbyExperts: MapExpert[] = [
      ...(currentExpertPin ? [currentExpertPin] : []),
      ...nearbyRaw.map(e => ({
        id: e.id, name: e.businessName || e.name,
        profileLink: e.profileLink || String(e.id),
        latitude: e.latitude!, longitude: e.longitude!,
        verified: e.verified, featured: e.featured,
        mapFeatured: e.mapFeatured, shortDesc: e.shortDesc,
        categories: e.categories.map(c => ({ name: c.category.name, icon: c.category.icon, color: c.category.color })),
      })),
    ];

    type SocialEntry = { url: string | null | undefined; icon: React.ComponentType<{ className?: string }>; label: string; color: string };
    const socialLinks: SocialEntry[] = [
      { url: expert.linkedinUrl, icon: Linkedin, label: 'LinkedIn', color: 'text-blue-400 hover:text-blue-300' },
      { url: expert.instagramUrl, icon: Instagram, label: 'Instagram', color: 'text-pink-400 hover:text-pink-300' },
      { url: expert.twitterUrl, icon: Twitter, label: 'Twitter', color: 'text-sky-400 hover:text-sky-300' },
      { url: expert.facebookUrl, icon: Facebook, label: 'Facebook', color: 'text-blue-500 hover:text-blue-400' },
      { url: expert.tiktokUrl, icon: Tag, label: 'TikTok', color: 'text-slate-300 hover:text-white' },
      { url: expert.youtubeUrl, icon: Youtube, label: 'YouTube', color: 'text-red-400 hover:text-red-300' },
    ].filter(s => s.url) as SocialEntry[];

    const availability = (expert.availabilityStatus ?? 'AVAILABLE') as keyof typeof AVAILABILITY_CONFIG;
    const avail = AVAILABILITY_CONFIG[availability] ?? AVAILABILITY_CONFIG.AVAILABLE;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">

        {/* Back nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <Link href={`/${countryCode}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            ← {countryCode.toUpperCase()}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {/* ── HERO ── */}
          <div className="rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none mb-6">
            {/* Cover */}
            <div className={`relative w-full ${expert.coverPhoto ? 'h-48 sm:h-64' : 'h-28 sm:h-36'} overflow-hidden`}>
              {expert.coverPhoto ? (
                <img src={expert.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-amber-400/10 to-orange-500/5 dark:from-orange-500/30 dark:via-amber-400/15 dark:to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

            <div className="px-6 md:px-10 pb-8">
              {/* Avatar row — avatar left, owner actions right */}
              <div className="-mt-14 mb-5 flex items-end justify-between gap-4">
                <div className="relative shrink-0">
                  {expert.profilePicture ? (
                    <img src={expert.profilePicture} alt={displayName}
                      className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-xl" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-3xl border-4 border-white dark:border-slate-800 shadow-xl">
                      {initials(displayName)}
                    </div>
                  )}
                  <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 ${avail.color}`} title={avail.label} />
                </div>

                {/* Owner edit actions */}
                {isOwner && (
                  <div className="flex flex-wrap gap-2 pb-1">
                    <Link href="/dashboard/profile"
                      className="inline-flex items-center gap-2 border border-orange-500/40 hover:border-orange-500/70 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </Link>
                    <Link href="/dashboard/completed-work"
                      className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                      + Post Work
                    </Link>
                  </div>
                )}
              </div>

              {/* Name + badges */}
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
                {expert.foundingExpert && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-gradient-to-r dark:from-orange-500/25 dark:to-amber-500/15 border border-amber-200 dark:border-orange-400/30 text-amber-700 dark:text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Crown className="w-3.5 h-3.5" /> Founding Expert
                  </span>
                )}
                {expert.verified && (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/25 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {!expert.profileVisible && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    On Vacation
                  </span>
                )}
              </div>

              {/* Service title / headline */}
              {expert.serviceTitle && (
                <p className="text-base text-orange-500 dark:text-orange-400 font-semibold mb-2">{expert.serviceTitle}</p>
              )}

              {/* Categories */}
              {expert.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {expert.categories.map((ec) => (
                    <Link key={`${ec.expertId}-${ec.categoryId}`}
                      href={`/${countryCode}/categories/${ec.category.slug}`}
                      className="text-xs bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-500/20 px-2.5 py-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-500/25 transition-colors">
                      {ec.category.icon && <span className="mr-1">{ec.category.icon}</span>}{ec.category.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Short desc */}
              {expert.shortDesc && (
                <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-4 max-w-3xl">{expert.shortDesc}</p>
              )}

              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                {avgRating !== null && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <strong className="text-slate-900 dark:text-white">{avgRating.toFixed(1)}</strong>
                    <span>({expert.reviews.length} review{expert.reviews.length !== 1 ? "s" : ""})</span>
                  </span>
                )}
                {expert.yearsOfExperience != null && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {expert.yearsOfExperience}+ yrs experience
                  </span>
                )}
                {expert.responseTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {expert.responseTime}
                  </span>
                )}
                {expert.clientsServed != null && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {expert.clientsServed}+ clients
                  </span>
                )}
                {expert.startingRate != null && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    From ${expert.startingRate.toLocaleString()}{expert.startingRateUnit ? ` ${expert.startingRateUnit}` : ''}
                  </span>
                )}
                {expert.countryCode && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {expert.countryCode.toUpperCase()}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${avail.bg} ${avail.textColor} ${avail.border}`}>
                  <span className={`w-2 h-2 rounded-full ${avail.color}`} />
                  {avail.label}
                </span>
              </div>

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mb-5">
                  {socialLinks.map(({ url, icon: Icon, label, color }) => (
                    <a key={label} href={url!} target="_blank" rel="noopener noreferrer"
                      className={`${color} transition-colors`} title={label}>
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}

              {/* Contact / action buttons — prominent row below profile info */}
              {(expert.phone || expert.whatsapp || expert.email || expert.webAddress || expert.ctaLabel || (!isOwner && expertUser)) && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-white/8">
                  {expert.phone && (
                    <a href={`tel:${expert.phone}`}
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-orange-500/20">
                      <Phone className="w-4 h-4" /> Call Now
                    </a>
                  )}
                  {expert.whatsapp && (
                    <a href={`https://wa.me/${expert.whatsapp.replace(/\D/g, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                  {!isOwner && expertUser && <MessageButton toUserId={expertUser.id} />}
                  {expert.email && (
                    <a href={`mailto:${expert.email}`}
                      className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 hover:border-orange-400 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  )}
                  {expert.webAddress && (
                    <a href={expert.webAddress} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 hover:border-orange-400 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                  {expert.ctaLabel && expert.ctaUrl && (
                    <a href={expert.ctaUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm">
                      <ExternalLink className="w-4 h-4" /> {expert.ctaLabel}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── TWO-COLUMN LAYOUT ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT / MAIN COLUMN */}
            <div className="lg:col-span-2 space-y-6">

              {/* Video Intro */}
              {expert.videoIntroUrl && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none">
                  <div className="px-6 pt-6 pb-3 flex items-center gap-2">
                    <Video className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Video Introduction</h2>
                  </div>
                  <div className="aspect-video">
                    <iframe
                      src={expert.videoIntroUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* About */}
              {expert.bio && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About</h2>
                  <p className="text-slate-500 dark:text-slate-300 leading-relaxed whitespace-pre-line">{expert.bio}</p>
                </div>
              )}

              {/* Skills */}
              {expert.skills.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {expert.skills.map((skill) => (
                      <span key={skill.id}
                        className="text-sm bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {expert.services.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Services</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {expert.services.map((service) => {
                      const servicePrice = (service as unknown as { price?: number | null }).price;
                      return (
                        <div key={service.id}
                          className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/8 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                                <Award className="w-4 h-4 text-orange-500" />
                              </div>
                              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{service.name}</h3>
                            </div>
                          </div>
                          {service.description && (
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3">{service.description}</p>
                          )}
                          {(servicePrice != null || service.rateUnit) && (
                            <p className="text-orange-500 dark:text-orange-400 font-bold text-sm">
                              {servicePrice != null ? `$${servicePrice.toLocaleString()}` : ''}
                              {service.rateUnit ? ` ${service.rateUnit}` : ''}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Widget */}
              {expert.allowBooking && expert.profileLink && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none">
                  <BookingWidget expertSlug={expert.profileLink} countryCode={countryCode} />
                </div>
              )}

              {/* Portfolio */}
              {expert.portfolio.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Portfolio</h2>
                  <PortfolioLightbox items={expert.portfolio.map(item => ({
                    id: item.id, title: item.title, description: item.description,
                    imageUrl: item.imageUrl, videoUrl: item.videoUrl,
                  }))} />
                </div>
              )}

              {/* Completed Work */}
              {expertCompletedWork.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Completed Work</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {expertCompletedWork.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-100 dark:border-white/8 overflow-hidden hover:border-orange-200 dark:hover:border-orange-500/30 transition-all flex flex-col">
                        {item.imageUrl ? (
                          <div className="w-full h-40 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
                            <img src={item.imageUrl} alt={item.title ?? ""} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-orange-500/10 to-amber-500/5 dark:from-orange-500/15 dark:to-amber-500/8 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-orange-400/30" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1.5 line-clamp-2">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 flex-1">{item.description}</p>
                          )}
                          {item.tags && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {item.tags.split(",").slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-500/15 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials */}
              {expert.testimonials.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">What Clients Say</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {expert.testimonials.map((t) => (
                      <div key={t.id}
                        className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/8 p-5 relative">
                        <Quote className="w-8 h-8 text-orange-500/20 dark:text-orange-400/15 absolute top-4 right-4" />
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 italic">&ldquo;{t.body}&rdquo;</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {t.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{t.clientName}</p>
                            {(t.clientTitle || t.clientCompany) && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {[t.clientTitle, t.clientCompany].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-6 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                  Reviews {expert.reviews.length > 0 && <span className="text-slate-400 font-normal text-base">({expert.reviews.length})</span>}
                </h2>
                {expert.reviews.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/8 p-8 text-center text-slate-400">
                    No reviews yet — be the first to work with {displayName}.
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/8 p-5 mb-5 flex flex-col sm:flex-row gap-5 items-center">
                      <div className="text-center shrink-0">
                        <p className="text-5xl font-bold text-orange-500 dark:text-orange-400">{avgRating!.toFixed(1)}</p>
                        <div className="flex justify-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating!) ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-slate-600"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{expert.reviews.length} review{expert.reviews.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex-1 w-full space-y-1.5">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-3">{star}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${expert.reviews.length ? (ratingDist[star] / expert.reviews.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-4">{ratingDist[star]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {expert.reviews.map((review) => (
                        <div key={review.id} className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/8 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {review.client.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-white text-sm">{review.client.name}</p>
                              <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex shrink-0">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-slate-600"}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-5">

              {/* Quick stats card */}
              {(expert.yearsOfExperience != null || expert.clientsServed != null || expert.startingRate != null || expert.projectMinimum != null) && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 shadow-sm dark:shadow-none">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">At a Glance</h3>
                  <div className="space-y-3">
                    {expert.yearsOfExperience != null && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Experience</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{expert.yearsOfExperience}+ years</p>
                        </div>
                      </div>
                    )}
                    {expert.clientsServed != null && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Clients Served</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{expert.clientsServed}+</p>
                        </div>
                      </div>
                    )}
                    {expert.startingRate != null && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Starting Rate</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            ${expert.startingRate.toLocaleString()}{expert.startingRateUnit ? ` ${expert.startingRateUnit}` : ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {expert.projectMinimum != null && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Project Minimum</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">${expert.projectMinimum.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {expert.responseTime && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Response Time</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{expert.responseTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Industries */}
              {expert.industries.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 shadow-sm dark:shadow-none">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> Industries Served
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {expert.industries.map((ind) => (
                      <span key={ind.id}
                        className="text-xs bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full">
                        {ind.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {expert.certifications.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 shadow-sm dark:shadow-none">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400" /> Certifications
                  </h3>
                  <div className="space-y-3">
                    {expert.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 dark:text-white text-sm leading-tight">
                            {cert.credentialUrl ? (
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                                className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1">
                                {cert.name} <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            ) : cert.name}
                          </p>
                          {(cert.issuer || cert.year) && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {[cert.issuer, cert.year?.toString()].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {expert.awards.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 shadow-sm dark:shadow-none">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-slate-400" /> Awards & Recognition
                  </h3>
                  <div className="space-y-3">
                    {expert.awards.map((award) => (
                      <div key={award.id} className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 dark:text-white text-sm leading-tight">{award.title}</p>
                          {(award.issuer || award.year) && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {[award.issuer, award.year?.toString()].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {award.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{award.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location map + address */}
              {currentExpertPin && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none">
                  <ExpertMap
                    experts={[currentExpertPin]}
                    countryCode={countryCode}
                    center={{ lat: expert.latitude!, lng: expert.longitude! }}
                    zoom={14}
                    className="h-44"
                  />
                  {expert.officeAddress && (
                    <div className="px-4 py-3 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-300">{expert.officeAddress}</p>
                    </div>
                  )}
                </div>
              )}
              {!currentExpertPin && expert.officeAddress && (
                <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 shadow-sm dark:shadow-none">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Location
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{expert.officeAddress}</p>
                </div>
              )}

              {/* Sponsored */}
              <AdFeaturedExperts spot="PROFILE_SIDEBAR" country={countryCode} title="Sponsored Experts" layout="list" />
            </div>
          </div>

          {/* ── NEARBY EXPERTS MAP (full width) — only when there are other experts nearby ── */}
          {nearbyExperts.length > 1 && (
            <div className="mt-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm dark:shadow-none">
              <div className="p-6 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Experts Nearby in the Same Category</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {nearbyExperts.length - 1} other expert{nearbyExperts.length - 1 !== 1 ? "s" : ""} with similar services in {countryCode.toUpperCase()}
                </p>
              </div>
              <ExpertMap
                experts={nearbyExperts}
                countryCode={countryCode}
                center={expert.latitude && expert.longitude ? { lat: expert.latitude, lng: expert.longitude } : undefined}
                zoom={10}
                className="h-80 sm:h-96"
              />
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error("[ExpertPage] DB error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-center px-4">
        <div>
          <p className="text-red-500 dark:text-red-400 mb-4">Unable to load this profile right now. Please try again.</p>
          <Link href={`/${countryCode}`} className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300">← Back</Link>
        </div>
      </div>
    );
  }
}
