'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
// import { GoogleMap, Marker, InfoWindow } from '@googlemaps/react-wrapper';

interface Provider {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  phone?: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface MapComponentProps {
  providers: Provider[];
  categories: Category[];
  onProviderSelect?: (provider: Provider) => void;
  height?: string;
}

export default function MapComponent({ 
  providers, 
  categories,
  onProviderSelect, 
  height = '400px' 
}: MapComponentProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(providers);

  // Set up providers for display
  useEffect(() => {
    setFilteredProviders(providers);
  }, [providers]);

  // Calculate center of all providers
  useEffect(() => {
    if (filteredProviders.length > 0) {
      const avgLat = filteredProviders.reduce((sum, p) => sum + p.latitude, 0) / filteredProviders.length;
      const avgLng = filteredProviders.reduce((sum, p) => sum + p.longitude, 0) / filteredProviders.length;
      
      if (mapRef.current) {
        mapRef.current.panTo({ lat: avgLat, lng: avgLng });
        mapRef.current.setZoom(11);
      }
    }
  }, [filteredProviders]);

  const handleMarkerClick = (provider: Provider) => {
    setSelectedProvider(provider);
    if (onProviderSelect) {
      onProviderSelect(provider);
    }
  };

  const handleCloseInfoWindow = () => {
    setSelectedProvider(null);
  };

  return (
    <div className="w-full" style={{ height }}>
      
      
      {/* GoogleMap component commented out temporarily for build */}
      <div className="bg-gray-200 h-full flex items-center justify-center text-gray-500">
        Map placeholder - Google Maps integration coming soon
      </div>
    </div>
  );
}