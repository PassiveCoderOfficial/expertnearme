'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BannerCampaign {
  id: number;
  bannerImageUrl: string | null;
  bannerMobileImageUrl: string | null;
  bannerLinkUrl: string | null;
  bannerAltText: string | null;
}

const BANNER_H = 90;

export default function AdBanner() {
  const [campaign, setCampaign] = useState<BannerCampaign | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/ads/active')
      .then((r) => r.json())
      .then((d) => {
        if (d.BANNER_TOP) setCampaign(d.BANNER_TOP);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const trackClick = () => {
    if (!campaign) return;
    fetch(`/api/admin/ad-campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
  };

  const trackImpression = () => {
    if (!campaign) return;
    fetch(`/api/admin/ad-campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'impression' }),
    }).catch(() => {});
  };

  useEffect(() => {
    if (campaign) trackImpression();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  const visible = loaded && !!campaign && !dismissed;

  if (!visible) return null;

  const inner = <BannerContent campaign={campaign!} onDismiss={() => setDismissed(true)} />;

  return (
    <div
      className="w-full overflow-hidden border-b border-black/10 dark:border-white/5"
      style={{ height: BANNER_H }}
    >
      {campaign!.bannerLinkUrl ? (
        <a href={campaign!.bannerLinkUrl} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block w-full h-full">
          {inner}
        </a>
      ) : inner}
    </div>
  );
}

function BannerContent({
  campaign,
  onDismiss,
}: {
  campaign: BannerCampaign;
  onDismiss: () => void;
}) {
  const hasMobile = !!campaign.bannerMobileImageUrl;
  const hasDesktop = !!campaign.bannerImageUrl;

  return (
    <div className="relative w-full h-full bg-orange-500 flex items-center justify-center">
      {/* Desktop image: hidden on mobile if mobile image exists */}
      {hasDesktop && (
        <img
          src={campaign.bannerImageUrl!}
          alt={campaign.bannerAltText ?? 'Sponsored'}
          className={`w-full h-full object-cover object-center absolute inset-0 ${hasMobile ? 'hidden sm:block' : 'block'}`}
          style={{ maxWidth: 1200, margin: '0 auto' }}
        />
      )}

      {/* Mobile image: shown only on mobile */}
      {hasMobile && (
        <img
          src={campaign.bannerMobileImageUrl!}
          alt={campaign.bannerAltText ?? 'Sponsored'}
          className="block sm:hidden w-full h-full object-cover object-center absolute inset-0"
          style={{ maxWidth: 400, margin: '0 auto' }}
        />
      )}

      {/* Fallback text when no images */}
      {!hasDesktop && !hasMobile && (
        <span className="text-sm font-semibold text-white">Sponsored</span>
      )}

      <span className="absolute top-1.5 left-2 text-[10px] bg-black/40 text-white/70 px-1.5 py-0.5 rounded font-medium pointer-events-none z-10">
        Ad
      </span>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
        className="absolute top-1.5 right-2 text-white/60 hover:text-white transition-colors bg-black/30 rounded-full p-0.5 z-10"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
