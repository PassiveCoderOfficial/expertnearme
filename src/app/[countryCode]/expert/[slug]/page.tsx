import Link from "next/link";
import { prisma } from "@/lib/db";
import { Star, MapPin, Phone, Globe, Mail, Shield, CheckCircle, Award, Crown, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import ExpertMap, { MapExpert } from "@/components/ExpertMap";

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

export default async function ExpertProfilePage({ params }: ExpertProfilePageProps) {
  const { slug, countryCode } = await params;

  let expert: Awaited<ReturnType<typeof prisma.expert.findFirst>> | null = null;
  try {
    expert = await prisma.expert.findFirst({
      where: { profileLink: slug, countryCode },
      include: {
        categories: { include: { category: true } },
        services: { include: { category: true } },
        portfolio: true,
        reviews: {
          include: { client: true },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });
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

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center max-w-md mx-auto p-10 bg-slate-800/60 border border-white/10 rounded-2xl shadow-2xl">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Expert Not Found</h1>
          <p className="text-slate-400 mb-7">
            The expert you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href={`/${countryCode}`}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            ← Back to {countryCode.toUpperCase()}
          </Link>
        </div>
      </div>
    );
  }

  const displayName = expert.businessName || expert.name;
  const avgRating =
    expert.reviews.length > 0
      ? expert.reviews.reduce((s, r) => s + r.rating, 0) / expert.reviews.length
      : null;

  // Nearby experts: same country + same categories, with coordinates
  const categoryIds = expert.categories.map(c => c.categoryId);
  let nearbyRaw: Awaited<ReturnType<typeof prisma.expert.findMany>> = [];
  try {
    if (categoryIds.length > 0) {
      nearbyRaw = await prisma.expert.findMany({
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
        orderBy: [{ mapFeatured: 'desc' }, { featured: 'desc' }],
        take: 20,
      });
    }
  } catch (err) {
    console.error("[ExpertPage] nearby query error:", err);
  }

  // Build nearby list, always prepend the current expert so their pin is visible on the map
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

  function initials(name: string) {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

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
          {/* Top accent bar */}
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

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
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
            </div>

            {/* Contact sidebar */}
            <div className="shrink-0 flex flex-col gap-3 min-w-[160px]">
              {expert.phone && (
                <a
                  href={`tel:${expert.phone}`}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              )}
              {expert.whatsapp && (
                <a
                  href={`https://wa.me/${expert.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {expert.email && (
                <a
                  href={`mailto:${expert.email}`}
                  className="flex items-center justify-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
              {expert.webAddress && (
                <a
                  href={expert.webAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-white/15 hover:border-orange-500/40 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Globe className="w-4 h-4" /> Website
                </a>
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
            {expert.services.map((service) => (
              <div key={service.id} className="rounded-2xl bg-slate-800/50 border border-white/8 hover:border-orange-500/30 transition-colors p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-orange-400" />
                  <h3 className="font-semibold text-white">{service.name}</h3>
                </div>
                {service.description && (
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{service.description}</p>
                )}
                {service.rateUnit && (
                  <p className="text-orange-400 font-bold text-sm">
                    Billed {service.rateUnit}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {expert.portfolio.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-bold text-white mb-5">Portfolio</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {expert.portfolio.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-800/50 border border-white/8 overflow-hidden hover:border-orange-500/30 transition-colors group">
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt="Portfolio"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                {item.videoUrl && !item.imageUrl && (
                  <div className="aspect-video bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Video</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">
            Reviews {expert.reviews.length > 0 && <span className="text-slate-400 font-normal text-base">({expert.reviews.length})</span>}
          </h2>
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-400">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {expert.reviews.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/40 border border-white/8 p-10 text-center text-slate-500">
            No reviews yet — be the first to work with {displayName}.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {expert.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-slate-800/50 border border-white/8 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0">
                    {review.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{review.client.name}</p>
                    <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
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
                ? `${nearbyExperts.length - 1} other expert${nearbyExperts.length - 1 !== 1 ? 's' : ''} with similar services in ${countryCode.toUpperCase()}`
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

      {/* Footer */}
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
}
