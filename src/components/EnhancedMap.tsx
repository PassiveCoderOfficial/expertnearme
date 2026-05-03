'use client';

import { MapPin, Navigation, Star } from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
  verified: boolean;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  shortDesc?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface EnhancedMapProps {
  providers: Provider[];
  categories: Category[];
  onProviderSelect?: (provider: Provider) => void;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  height?: string;
  showControls?: boolean;
  editable?: boolean;
  initialLocation?: { lat: number; lng: number };
}

export default function EnhancedMap({
  providers,
  categories,
  onProviderSelect,
  onLocationChange,
  height = '600px',
  showControls = true,
  editable = false,
  initialLocation = { lat: 25.2048, lng: 55.2708 },
}: EnhancedMapProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ height }}>
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Map Preview</h3>
              <p className="text-xs text-slate-500">
                {providers.length} providers across {categories.length} categories
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Interactive Google Maps rendering is temporarily disabled in this build-safe fallback.
            {editable && (
              <button
                type="button"
                className="ml-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => onLocationChange?.(initialLocation)}
              >
                <Navigation className="h-3.5 w-3.5" />
                Use Initial Location
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => onProviderSelect?.(provider)}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{provider.name}</div>
                    <div className="text-xs text-slate-500">
                      {provider.category.icon ? `${provider.category.icon} ` : ''}
                      {provider.category.name}
                    </div>
                  </div>
                  {provider.rating != null && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {provider.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {provider.latitude.toFixed(4)}, {provider.longitude.toFixed(4)}
                </div>
              </button>
            ))}
          </div>

          {providers.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No providers available for map preview.
            </div>
          )}
        </div>

        {showControls && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Categories: {categories.map((category) => category.name).join(', ') || 'None'}
          </div>
        )}
      </div>
    </div>
  );
}
