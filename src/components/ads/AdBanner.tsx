'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BannerCampaign {
  id: number;
  bannerImageUrl: string | null;
  bannerLinkUrl: string | null;
  bannerAltText: string | null;
}

// Banner height = 90px (matches 1200×90 ad unit). Keep in sync with BANNER_H below.
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

  return (
    <>
      {/* Fixed banner pinned just below the fixed navbar (top-16 = 64px) */}
      {visible && (
        <div
          className="fixed left-0 right-0 z-40 overflow-hidden border-b border-black/10 dark:border-white/5"
          style={{ top: 64, height: BANNER_H }}
        >
          {campaign!.bannerLinkUrl ? (
            <a
              href={campaign!.bannerLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackClick}
              className="block w-full h-full"
            >
              <BannerContent campaign={campaign!} onDismiss={() => setDismissed(true)} />
            </a>
          ) : (
            <BannerContent campaign={campaign!} onDismiss={() => setDismissed(true)} />
          )}
        </div>
      )}

      {/* Sentinel — pushes page content below navbar + banner */}
      <div style={{ height: visible ? 64 + BANNER_H : 64 }} className="shrink-0" />
    </>
  );
}

function BannerContent({
  campaign,
  onDismiss,
}: {
  campaign: BannerCampaign;
  onDismiss: () => void;
}) {
  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
      {campaign.bannerImageUrl ? (
        <img
          src={campaign.bannerImageUrl}
          alt={campaign.bannerAltText ?? 'Sponsored'}
          className="w-full h-full object-cover object-center"
          style={{ maxWidth: 1200, margin: '0 auto', display: 'block' }}
        />
      ) : (
        <span className="text-sm font-semibold text-white">Sponsored</span>
      )}

      <span className="absolute top-1.5 left-2 text-[10px] bg-black/40 text-white/70 px-1.5 py-0.5 rounded font-medium pointer-events-none">
        Ad
      </span>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
        className="absolute top-1.5 right-2 text-white/60 hover:text-white transition-colors bg-black/30 rounded-full p-0.5"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
