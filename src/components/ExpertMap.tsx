'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin } from 'lucide-react';

export interface MapExpert {
  id: number;
  name: string;
  profileLink: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  featured: boolean;
  mapFeatured: boolean;
  profilePicture?: string | null;
  shortDesc?: string | null;
  categories?: Array<{ name: string; icon?: string | null; color?: string | null }>;
}

interface ExpertMapProps {
  experts: MapExpert[];
  countryCode: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  height?: string;
}

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',           stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry',       stylers: [{ color: '#2d2d44' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212135' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'water', elementType: 'geometry',      stylers: [{ color: '#0f0f23' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

function buildMarkerSvg(label: string, color: string, size: number, borderColor: string): string {
  const w = size + 8;
  const cx = w / 2;
  const r  = size / 2;
  const cy = 2 + r;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${size + 14}" viewBox="0 0 ${w} ${size + 14}">
    <ellipse cx="${cx}" cy="${size + 13}" rx="${r * 0.6}" ry="3" fill="rgba(0,0,0,0.4)"/>
    <path d="M${cx} 1C${cx - r + 2} 1 4 ${cy - r + 2} 4 ${cy}C4 ${cy + r * 0.9} ${cx} ${size + 8} ${cx} ${size + 8}S${w - 4} ${cy + r * 0.9} ${w - 4} ${cy}C${w - 4} ${cy - r + 2} ${cx + r - 2} 1 ${cx} 1z"
          fill="${color}" stroke="${borderColor}" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="rgba(0,0,0,0.5)"/>
    <text x="${cx}" y="${cy + (label.length === 1 ? 5 : 4)}" text-anchor="middle"
          font-size="${label.length === 1 ? 14 : 10}"
          font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',system-ui,sans-serif"
          fill="white" font-weight="bold">${label}</text>
  </svg>`;
}

function getCategoryLabel(expert: MapExpert): { label: string; color: string } {
  const cat = expert.categories?.[0];
  if (!cat) return { label: expert.mapFeatured || expert.featured ? '★' : '👤', color: expert.mapFeatured || expert.featured ? '#f97316' : '#6366f1' };
  const label = (cat.icon && cat.icon.length <= 3) ? cat.icon : cat.name.slice(0, 2);
  const color = cat.color || (expert.mapFeatured || expert.featured ? '#f97316' : '#6366f1');
  return { label, color };
}

interface MapInnerProps extends ExpertMapProps {
  onExpertClick?: (e: MapExpert) => void;
}

function MapInner({ experts, countryCode, center, zoom = 7, onExpertClick }: MapInnerProps) {
  const ref        = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const openInfoRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(ref.current, {
      center: center || { lat: 23.8, lng: 90.4 },
      zoom,
      styles: DARK_STYLE,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    experts.forEach(expert => {
      const isFeatured  = expert.mapFeatured || expert.featured;
      const markerSize  = isFeatured ? 40 : 30;
      const { label, color } = getCategoryLabel(expert);
      const borderColor = isFeatured ? '#fed7aa' : '#c7d2fe';

      const marker = new google.maps.Marker({
        map:      mapRef.current!,
        position: { lat: expert.latitude, lng: expert.longitude },
        title:    expert.name,
        icon: {
          url:        'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildMarkerSvg(label, color, markerSize, borderColor)),
          scaledSize: new google.maps.Size(markerSize + 8, markerSize + 14),
          anchor:     new google.maps.Point((markerSize + 8) / 2, markerSize + 14),
        },
        zIndex: isFeatured ? 10 : 1,
      });

      const catNames = expert.categories?.map(c => c.name).join(', ') || '';
      const infoContent = `
        <div style="background:#1e1e30;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;min-width:190px;max-width:230px;font-family:system-ui,sans-serif;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:34px;height:34px;border-radius:8px;background:${color}33;border:1px solid ${color}55;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">
              ${label}
            </div>
            <div style="flex:1;min-width:0;">
              <p style="color:#fff;font-weight:600;font-size:13px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${expert.name}</p>
              ${catNames ? `<p style="color:${color};font-size:11px;margin:0;">${catNames}</p>` : ''}
            </div>
          </div>
          ${expert.shortDesc ? `<p style="color:#94a3b8;font-size:11px;margin:0 0 8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${expert.shortDesc}</p>` : ''}
          ${isFeatured ? `<span style="display:inline-block;background:rgba(249,115,22,0.15);color:#fb923c;border:1px solid rgba(249,115,22,0.3);border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600;margin-bottom:8px;">★ Featured</span><br/>` : ''}
          <a href="/${countryCode}/expert/${expert.profileLink}"
             style="display:block;text-align:center;background:#f97316;color:#1a1a2e;font-weight:700;font-size:12px;padding:6px 12px;border-radius:8px;text-decoration:none;">
            View Profile →
          </a>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({ content: infoContent, disableAutoPan: false });
      marker.addListener('click', () => {
        openInfoRef.current?.close();
        infoWindow.open({ anchor: marker, map: mapRef.current });
        openInfoRef.current = infoWindow;
        onExpertClick?.(expert);
      });

      markersRef.current.push(marker);
    });

    if (experts.length > 0 && !center) {
      const bounds = new google.maps.LatLngBounds();
      experts.forEach(e => bounds.extend({ lat: e.latitude, lng: e.longitude }));
      mapRef.current?.fitBounds(bounds, { top: 60, right: 40, bottom: 60, left: 40 });
    }
  }, [experts, countryCode, center, onExpertClick]);

  return <div ref={ref} className="w-full h-full" />;
}

function MapPlaceholder({ status }: { status: Status }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl border border-white/8">
      {status === Status.LOADING ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          Loading map…
        </div>
      ) : (
        <div className="text-center text-slate-500 text-sm">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          Map failed to load.
          <span className="text-xs block mt-1 text-slate-600">Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
        </div>
      )}
    </div>
  );
}

export default function ExpertMap({ experts, countryCode, center, zoom, className = '', height }: ExpertMapProps) {
  const apiKey     = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const [selected, setSelected] = useState<MapExpert | null>(null);
  const withCoords = experts.filter(e => e.latitude && e.longitude);

  const containerStyle = height ? { height } : undefined;

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-slate-900/60 rounded-2xl border border-dashed border-white/10 ${className}`} style={containerStyle}>
        <div className="text-center text-slate-500 text-sm py-12">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="font-medium text-slate-400 mb-1">Map not configured</p>
          <p className="text-xs text-slate-600">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
        </div>
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-slate-900/60 rounded-2xl border border-dashed border-white/10 ${className}`} style={containerStyle}>
        <div className="text-center text-slate-500 text-sm py-12">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="text-xs">No experts with location data yet.</p>
        </div>
      </div>
    );
  }

  const featuredCount = withCoords.filter(e => e.mapFeatured || e.featured).length;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/8 ${className}`} style={containerStyle}>
      <Wrapper apiKey={apiKey} render={(status) => <MapPlaceholder status={status} />}>
        <MapInner
          experts={withCoords}
          countryCode={countryCode}
          center={center}
          zoom={zoom}
          onExpertClick={setSelected}
        />
      </Wrapper>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-400 backdrop-blur-sm pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          Featured
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          Expert
        </span>
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-400 backdrop-blur-sm pointer-events-none">
        <span>{withCoords.length} on map</span>
        {featuredCount > 0 && <span className="text-orange-400">• {featuredCount} featured</span>}
      </div>

      {/* Selected mini-card */}
      {selected && (
        <div className="absolute bottom-12 left-3 right-3 sm:left-auto sm:right-3 sm:w-64 bg-slate-900/95 border border-white/10 rounded-xl p-3 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-400 shrink-0">
              {selected.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-xs truncate">{selected.name}</p>
              <p className="text-slate-500 text-xs truncate">{selected.categories?.[0]?.name || ''}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-white text-xs ml-1 shrink-0">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
