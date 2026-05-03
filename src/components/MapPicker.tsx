'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, X, Search } from 'lucide-react';

export interface LatLng { lat: number; lng: number }

interface MapPickerInnerProps {
  value: LatLng | null;
  onChange: (coords: LatLng, address?: string) => void;
  defaultCenter?: LatLng;
}

function MapPickerInner({ value, onChange, defaultCenter }: MapPickerInnerProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const defaultPos = defaultCenter || { lat: 23.8, lng: 90.4 };

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(ref.current, {
      center: value || defaultPos,
      zoom: value ? 14 : 8,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f23' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
    });

    // Place marker if value already exists
    if (value) placeMarker(value);

    mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      placeMarker(coords);
      reverseGeocode(coords).then(address => onChange(coords, address));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when value changes externally
  useEffect(() => {
    if (!mapRef.current || !value) return;
    placeMarker(value);
    mapRef.current.panTo(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  function placeMarker(pos: LatLng) {
    if (!mapRef.current) return;
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new google.maps.Marker({
      position: pos,
      map: mapRef.current,
      draggable: true,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24S32 28 32 16C32 7.163 24.837 0 16 0z" fill="#f97316"/>
            <circle cx="16" cy="16" r="7" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40),
      },
      zIndex: 100,
    });
    markerRef.current.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      reverseGeocode(coords).then(address => onChange(coords, address));
    });
  }

  async function reverseGeocode(coords: LatLng): Promise<string | undefined> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: coords });
      return result.results[0]?.formatted_address;
    } catch {
      return undefined;
    }
  }

  return <div ref={ref} className="w-full h-full" />;
}

function MapLoadingStatus({ status }: { status: Status }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl border border-white/8">
      {status === Status.LOADING ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          Loading map…
        </div>
      ) : (
        <div className="text-center text-slate-500 text-sm">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p>Map failed to load.</p>
          <p className="text-xs text-slate-600 mt-1">Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
        </div>
      )}
    </div>
  );
}

interface MapPickerProps {
  value: LatLng | null;
  onChange: (coords: LatLng, address?: string) => void;
  defaultCenter?: LatLng;
  address?: string;
  className?: string;
  label?: string;
}

export default function MapPicker({ value, onChange, defaultCenter, address, className = '', label }: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!search.trim() || !apiKey) return;
    setSearching(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: search });
      if (result.results[0]?.geometry?.location) {
        const loc = result.results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        onChange(coords, result.results[0].formatted_address);
      }
    } catch {
      // ignore
    }
    setSearching(false);
  }, [search, apiKey, onChange]);

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-slate-900/60 rounded-xl border border-dashed border-white/10 py-10 ${className}`}>
        <div className="text-center text-slate-500 text-sm">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400 mb-1">Map not configured</p>
          <p className="text-xs text-slate-600">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs text-slate-400 font-medium">{label}</label>}

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 focus-within:border-orange-500/40 transition-colors">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search address or location…"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !search.trim()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-xl text-slate-900 font-semibold text-sm transition-colors"
        >
          {searching ? '…' : 'Go'}
        </button>
      </div>

      {/* Map canvas */}
      <div className="h-64 rounded-xl overflow-hidden border border-white/8 relative">
        <Wrapper apiKey={apiKey} render={(status) => <MapLoadingStatus status={status} />}>
          <MapPickerInner value={value} onChange={onChange} defaultCenter={defaultCenter} />
        </Wrapper>
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <p className="text-center text-xs text-white/60 bg-slate-900/70 rounded-lg py-1 px-2 backdrop-blur-sm">
            Click on the map or drag the pin to set your location
          </p>
        </div>
      </div>

      {/* Coords display */}
      {value && (
        <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/60 border border-white/8 rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="font-mono">{value.lat.toFixed(6)}, {value.lng.toFixed(6)}</span>
          {address && <span className="truncate text-slate-500">— {address}</span>}
          <button
            onClick={() => onChange({ lat: 0, lng: 0 })}
            className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
            title="Clear location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
