import Link from "next/link";
import { prisma } from "@/lib/db";
import { Star, MapPin, Phone, Globe, Mail, CheckCircle, Award, Crown, MessageCircle, Pencil, Linkedin, Instagram, Twitter, Facebook } from "lucide-react";
import type { Metadata } from "next";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";
import AdFeaturedExperts from "@/components/ads/AdFeaturedExperts";
import BookingWidget from "@/components/BookingWidget";
import MessageButton from "@/components/MessageButton";
import PortfolioLightbox from "@/components/PortfolioLightbox";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";

interface ExpertProfilePageProps {
  params: Promise<{ slug: string; countryCode: string }>;
}

export async function generateMetadata({ params }: ExpertProfilePageProps): Promise<Metadata> {
  try {
    const { slug, countryCode } = await params;
    const expert = await prisma.expert.findFirst({ where: { profileLink: slug, countryCode } });
    if (!expert) return { title: "Expert Not Found — ExpertNear.Me" };
    return {
      title: `${expert.businessName || expert.name} — ExpertNear.Me`,
      description: expert.shortDesc ?? undefined,
    };
  } catch {
    return { title: "ExpertNear.Me" };
  }
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function ExpertProfilePage({ params }: ExpertProfilePageProps) {
  const { slug, countryCode } = await params;

  try {
    const expert = await prisma.expert.findFirst({
      where: { profileLink: slug, countryCode },
      include: {
        categories: { include: { category: true } },
        services: { include: { category: true }, orderBy: { sortOrder: 'asc' } },
        portfolio: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          include: { client: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!expert) notFound();

    const [expertUser, session] = await Promise.all([
      prisma.user.findUnique({ where: { email: expert.email }, select: { id: true } }).catch(() => null),
      getSession(),
    ]);
    const isOwner = session.authenticated && session.email === expert.email;
    const displayName = expert.businessName || expert.name;

    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of expert.reviews) ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
    const avgRating =
      expert.reviews.length > 0
        ? expert.reviews.reduce((s, r) => s + r.rating, 0) / expert.reviews.length
        : null;

    const categoryIds = expert.categories.map(c => c.categoryId);

    const nearbyRaw = await prisma.expert.findMany({
      where: {
        countryCode,
        verified: true,
        id: { not: expert.id },
        latitude: { not: null },
        longitude: { not: null },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      include: {
        categories: { include: { category: { select: { name: true, icon: true, color: true } } } },
      },
      orderBy: [{ mapFeatured: "desc" }, { featured: "desc" }],
      take: 20,
    }).catch(() => []);

    const currentExpertPin: MapExpert | null = (expert.latitude && expert.longitude) ? {
      id:          expert.id,
      name:        displayName,
      profileLink: expert.profileLink || String(expert.id),
      latitude:    expert.latitude,
      longitude:   expert.longitude,
      verified:    expert.verified,
      featured:    expert.featured,
      mapFeatured: expert.mapFeatured,
      shortDesc:   expert.shortDesc,
      categories:  expert.categories.map(c => ({ name: c.category.name, icon: null, color: null })),
    } : null;

    const nearbyExperts: MapExpert[] = [
      ...(currentExpertPin ? [currentExpertPin] : []),
      ...nearbyRaw.map(e => ({
        id:          e.id,
        name:        e.businessName || e.name,
        profileLink: e.profileLink || String(e.id),
        latitude:    e.latitude!,
        longitude:   e.longitude!,
        verified:    e.verified,
        featured:    e.featured,
        mapFeatured: e.mapFeatured,
        shortDesc:   e.shortDesc,
        categories:  e.categories.map(c => ({ name: c.category.name, icon: c.category.icon, color: c.category.color })),
      })),
    ];

    const socialLinks = [
      { url: (expert as unknown as { linkedinUrl?: string | null }).linkedinUrl, icon: Linkedin, label: 'LinkedIn', color: 'text-blue-400' },
      { url: (expert as unknown as { instagramUrl?: string | null }).instagramUrl, icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
      { url: (expert as unknown as { twitterUrl?: string | null }).twitterUrl, icon: Twitter, label: 'Twitter', color: 'text-sky-400' },
      { url: (expert as unknown as { facebookUrl?: string | null }).facebookUrl, icon: Facebook, label: 'Facebook', color: 'text-blue-500' },
    ].filter(s => s.url);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        {/* Back nav */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-4">
          <Link href={`/${countryCode}`} className="text-sm text-slate-400 hover:text-orange-400 transition-colors">
            ← Back to {countryCode.toUpperCase()}
          </Link>
        </div>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <div className="rounded-2xl bg-slate-800/60 border border-white/8 overflow-hidden">
            {expert.coverPhoto && (
              <div className="w-full h-40 sm:h-52 overflow-hidden">
                <img src={expert.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

            <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                {expert.profilePicture ? (
                  <img
                    src={expert.profilePicture}
                    alt={displayName}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-2 border-orange-500/30"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-3xl border-2 border-orange-500/30">
                    {initials(displayName)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                  {expert.foundingExpert && (
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/25 to-amber-500/15 border border-orange-400/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Crown className="w-3.5 h-3.5" /> Founding Expert
                    </span>
                  )}
                  {expert.verified && (
                    <span className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/25 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                {expert.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.categories.map((ec) => (
                      <span key={`${ec.expertId}-${ec.categoryId}`} className="text-xs bg-orange-500/15 text-orange-300 border border-orange-500/20 px-2.5 py-1 rounded-full">
                        {ec.category.name}
                      </span>
                    ))}
                  </div>
                )}

                {expert.shortDesc && (
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{expert.shortDesc}</p>
                )}

                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400 mb-4">
                  {avgRating !== null && (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <strong className="text-white">{avgRating.toFixed(1)}</strong>
                      <span>({expert.reviews.length} review{expert.reviews.length !== 1 ? "s" : ""})</span>
                    </span>
                  )}
                  {expert.countryCode && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {expert.countryCode.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Social links */}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    {socialLinks.map(({ url, icon: Icon, label, color }) => (
                      <a key={label} href={url!} target="_blank" rel="noopener noreferrer"
                        className={`${color} hover:opacity-80 transition-opacity`} title={label}>
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact sidebar */}
              <div className="shrink-0 flex flex-col gap-3 min-w-[160px]">
                {expert.phone && (
                  <a href={`tel:${expert.phone}`}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                )}
                {expert.whatsapp && (
                  <a href={`https://wa.me/${expert.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {expert.email && (
                  <a href={`mailto:${expert.email}`}
                    className="flex items-center justify-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                )}
                {expert.webAddress && (
                  <a href={expert.webAddress} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
                {isOwner ? (
                  <Link href="/dashboard/profile"
                    className="flex items-center justify-center gap-2 border border-orange-500/40 hover:border-orange-500/70 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </Link>
                ) : (
                  expertUser && <MessageButton toUserId={expertUser.id} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bio */}
        {expert.bio && (
          <section className="max-w-6xl mx-auto px-6 pb-10">
            <div className="rounded-2xl bg-slate-800/50 border border-white/8 p-8">
              <h2 className="text-lg font-bold text-white mb-4">About</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{expert.bio}</p>
            </div>
          </section>
        )}

        {/* Services */}
        {expert.services.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-10">
            <h2 className="text-xl font-bold text-white mb-5">Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {expert.services.map((service) => {
                const servicePrice = (service as unknown as { price?: number | null }).price;
                return (
                  <div key={service.id} className="rounded-2xl bg-slate-800/50 border border-white/8 hover:border-orange-500/30 transition-colors p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-orange-400 shrink-0" />
                      <h3 className="font-semibold text-white">{service.name}</h3>
                    </div>
                    {service.description && (
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">{service.description}</p>
                    )}
                    {(servicePrice != null || service.rateUnit) && (
                      <p className="text-orange-400 font-bold text-sm">
                        {servicePrice != null ? `$${servicePrice.toLocaleString()}` : ''}
                        {service.rateUnit ? ` ${service.rateUnit}` : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Booking Widget */}
        {expert.allowBooking && expert.profileLink && (
          <section className="max-w-6xl mx-auto px-6 pb-10">
            <BookingWidget expertSlug={expert.profileLink} countryCode={countryCode} />
          </section>
        )}

        {/* Portfolio — client component for lightbox */}
        {expert.portfolio.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-10">
            <h2 className="text-xl font-bold text-white mb-5">Portfolio</h2>
            <PortfolioLightbox items={expert.portfolio.map(item => ({
              id: item.id,
              title: item.title,
              description: item.description,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
            }))} />
          </section>
        )}

        {/* Reviews */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-bold text-white mb-5">
            Reviews {expert.reviews.length > 0 && <span className="text-slate-400 font-normal text-base">({expert.reviews.length})</span>}
          </h2>

          {expert.reviews.length === 0 ? (
            <div className="rounded-2xl bg-slate-800/40 border border-white/8 p-10 text-center text-slate-500">
              No reviews yet — be the first to work with {displayName}.
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-800/50 border border-white/8 p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-bold text-orange-400">{avgRating!.toFixed(1)}</p>
                  <div className="flex justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating!) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{expert.reviews.length} review{expert.reviews.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-3">{star}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${expert.reviews.length ? (ratingDist[star] / expert.reviews.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-4">{ratingDist[star]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {expert.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-slate-800/50 border border-white/8 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0">
                        {review.client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{review.client.name}</p>
                        <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Sponsored similar experts */}
        <section className="max-w-6xl mx-auto px-6 pb-6">
          <AdFeaturedExperts
            spot="PROFILE_SIDEBAR"
            country={countryCode}
            title="Sponsored Experts"
            layout="list"
          />
        </section>

        {/* Nearby Experts Map */}
        {nearbyExperts.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 pb-12">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">
                {nearbyExperts.length > 1 ? "Experts Nearby in the Same Category" : "Location"}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {nearbyExperts.length > 1
                  ? `${nearbyExperts.length - 1} other expert${nearbyExperts.length - 1 !== 1 ? "s" : ""} with similar services in ${countryCode.toUpperCase()}`
                  : `Showing ${displayName}'s location`}
              </p>
            </div>
            <ExpertMap
              experts={nearbyExperts}
              countryCode={countryCode}
              center={expert.latitude && expert.longitude ? { lat: expert.latitude, lng: expert.longitude } : undefined}
              zoom={nearbyExperts.length > 1 ? 10 : 13}
              className="h-80 sm:h-96"
            />
          </section>
        )}

        <footer className="border-t border-white/5 bg-slate-950/50">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>
              <span className="text-orange-400 font-bold mr-1">ExpertNear.Me</span>
              © {new Date().getFullYear()}
            </span>
            <div className="flex items-center gap-5">
              <Link href="/" className="hover:text-slate-300 transition-colors">Find Experts</Link>
              <Link href="/for-experts" className="hover:text-slate-300 transition-colors">For Experts</Link>
              <a href="mailto:info@expertnear.me" className="hover:text-slate-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (err) {
    console.error("[ExpertPage] DB error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-center px-4">
        <div>
          <p className="text-red-400 mb-4">Unable to load this profile right now. Please try again.</p>
          <Link href={`/${countryCode}`} className="text-orange-400 hover:text-orange-300">← Back</Link>
        </div>
      </div>
    );
  }
}
