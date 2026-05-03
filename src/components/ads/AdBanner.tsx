'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BannerCampaign {
  id: number;
  bannerImageUrl: string | null;
  bannerLinkUrl: string | null;
  bannerAltText: string | null;
}

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
  }, [campaign]);

  if (!loaded || !campaign || dismissed) return null;

  const content = (
    <div className="relative w-full bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {campaign.bannerImageUrl ? (
          <img
            src={campaign.bannerImageUrl}
            alt={campaign.bannerAltText ?? 'Sponsored'}
            className="h-8 object-contain"
          />
        ) : (
          <span className="text-sm font-semibold text-white">Sponsored</span>
        )}
        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium shrink-0">
          Ad
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto shrink-0 text-white/70 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (campaign.bannerLinkUrl) {
    return (
      <a href={campaign.bannerLinkUrl} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block">
        {content}
      </a>
    );
  }

  return content;
}
