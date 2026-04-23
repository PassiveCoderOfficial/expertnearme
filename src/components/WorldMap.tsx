'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin } from 'lucide-react';

export interface CountryPin {
  code: string;
  name: string;
  flagEmoji?: string;
  lat: number;
  lng: number;
  expertCount?: number;
}

// Approximate country centroids
export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  bd: { lat: 23.69, lng: 90.35 },
  ae: { lat: 24.47, lng: 54.37 },
  sa: { lat: 24.68, lng: 46.72 },
  qa: { lat: 25.35, lng: 51.18 },
  om: { lat: 21.51, lng: 55.92 },
  kw: { lat: 29.37, lng: 47.98 },
  bh: { lat: 26.06, lng: 50.55 },
  sg: { lat: 1.35,  lng: 103.82 },
  my: { lat: 3.14,  lng: 101.69 },
  id: { lat: -0.79, lng: 113.92 },
  ph: { lat: 12.88, lng: 121.77 },
  in: { lat: 20.59, lng: 78.96 },
  pk: { lat: 30.38, lng: 69.35 },
  lk: { lat: 7.87,  lng: 80.77 },
  np: { lat: 28.39, lng: 84.12 },
  gb: { lat: 55.38, lng: -3.44 },
  us: { lat: 37.09, lng: -95.71 },
  au: { lat: -25.27, lng: 133.78 },
  ca: { lat: 56.13, lng: -106.35 },
  de: { lat: 51.17, lng: 10.45 },
};

interface WorldMapInnerProps {
  countries: CountryPin[];
}

function WorldMapInner({ countries }: WorldMapInnerProps) {
  const ref        = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    mapRef.current = new google.maps.Map(ref.current, {
      center:  { lat: 20, lng: 50 },
      zoom:    3,
      minZoom: 2,
      maxZoom: 8,
      styles: [
        { elementType: 'geometry',            stylers: [{ color: '#0d1117' }] },
        { elementType: 'labels.text.stroke',  stylers: [{ color: '#0d1117' }] },
        { elementType: 'labels.text.fill',    stylers: [{ color: '#6b7280' }] },
        { featureType: 'road',                stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }, { weight: 1 }] },
        { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'simplified' }, { color: '#374151' }] },
        { featureType: 'water',               elementType: 'geometry', stylers: [{ color: '#06111f' }] },
        { featureType: 'poi',                 stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
        { featureType: 'landscape',           elementType: 'geometry', stylers: [{ color: '#111827' }] },
      ],
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
    });

    setMapReady(true);
    return () => { mapRef.current = null; setMapReady(false); };
  }, []);

  // Add / replace markers whenever the map becomes ready or countries list changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    countries.forEach(country => {
      const hasExperts = (country.expertCount || 0) > 0;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="70" viewBox="0 0 60 70">
        <ellipse cx="30" cy="68" rx="14" ry="4" fill="rgba(0,0,0,0.4)"/>
        <path d="M30 2C18.954 2 10 10.954 10 22c0 14.667 20 46 20 46S50 36.667 50 22C50 10.954 41.046 2 30 2z"
              fill="${hasExperts ? '#f97316' : '#374151'}"
              stroke="${hasExperts ? '#fed7aa' : '#4b5563'}" stroke-width="1.5"/>
        <circle cx="30" cy="22" r="14" fill="${hasExperts ? '#1a0a00' : '#1e293b'}"/>
        <text x="30" y="27" text-anchor="middle" font-size="14"
              font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif">${country.flagEmoji || '🌍'}</text>
      </svg>`;

      const marker = new google.maps.Marker({
        position: { lat: country.lat, lng: country.lng },
        map:      mapRef.current!,
        title:    country.name,
        icon: {
          url:        'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(60, 70),
          anchor:     new google.maps.Point(30, 68),
        },
        zIndex: hasExperts ? 10 : 1,
      });

      const infoContent = `
        <div style="background:#0f172a;border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:14px 16px;min-width:160px;font-family:system-ui,sans-serif;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:22px;line-height:1;">${country.flagEmoji || '🌍'}</span>
            <div>
              <p style="color:#fff;font-weight:700;font-size:14px;margin:0;">${country.name}</p>
              ${country.expertCount ? `<p style="color:#f97316;font-size:11px;margin:0;">${country.expertCount} expert${country.expertCount !== 1 ? 's' : ''}</p>` : ''}
            </div>
          </div>
          <a href="/${country.code}" style="display:block;text-align:center;background:#f97316;color:#1a1a2e;font-weight:700;font-size:12px;padding:6px 12px;border-radius:8px;text-decoration:none;margin-top:4px;">
            Browse Experts →
          </a>
        </div>`;

      const infoWindow = new google.maps.InfoWindow({ content: infoContent, disableAutoPan: false });
      marker.addListener('click', () => infoWindow.open({ anchor: marker, map: mapRef.current }));
      markersRef.current.push(marker);
    });
  }, [mapReady, countries]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} className="w-full h-full" />;
}

function WorldMapPlaceholder({ status }: { status: Status }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/80">
      {status === Status.LOADING ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          Loading world map…
        </div>
      ) : (
        <div className="text-center text-slate-500 text-sm">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          Map unavailable
        </div>
      )}
    </div>
  );
}

interface WorldMapProps {
  countries: CountryPin[];
  className?: string;
}

export default function WorldMap({ countries, className = '' }: WorldMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-slate-900/60 rounded-2xl border border-dashed border-white/10 ${className}`}>
        <div className="text-center text-slate-500 text-sm py-12">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="font-medium text-slate-400 mb-1">World map not configured</p>
          <p className="text-xs text-slate-600">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/8 ${className}`}>
      <Wrapper apiKey={apiKey} render={(status) => <WorldMapPlaceholder status={status} />}>
        <WorldMapInner countries={countries} />
      </Wrapper>
      {/* Overlay hint */}
      <div className="absolute bottom-3 left-3 bg-slate-900/85 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-400 pointer-events-none backdrop-blur-sm">
        Click a pin to explore
      </div>
      <div className="absolute top-3 right-3 bg-slate-900/85 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-orange-400 pointer-events-none backdrop-blur-sm font-medium">
        {countries.length} countries active
      </div>
    </div>
  );
}
