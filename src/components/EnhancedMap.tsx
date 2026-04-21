'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import { GoogleMap, Marker, InfoWindow } from '@googlemaps/react-wrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PinDrop, 
  EditLocation, 
  Save, 
  Cancel,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Navigation,
  RotateCcw
} from 'lucide-react';

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

interface CustomMarker {
  id: number;
  position: { lat: number; lng: number };
  category: Category;
  provider?: Provider;
}

export default function EnhancedMap({ 
  providers, 
  categories,
  onProviderSelect,
  onLocationChange,
  height = '600px',
  showControls = true,
  editable = false,
  initialLocation = { lat: 25.2048, lng: 55.2708 }
}: EnhancedMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [filteredMarkers, setFilteredMarkers] = useState<CustomMarker[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingMarker, setDraggingMarker] = useState<CustomMarker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [customLocation, setCustomLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Calculate center of all providers
  const calculateCenter = useCallback((providers: Provider[]) => {
    if (providers.length === 0) return initialLocation;
    
    const avgLat = providers.reduce((sum, p) => sum + p.latitude, 0) / providers.length;
    const avgLng = providers.reduce((sum, p) => sum + p.longitude, 0) / providers.length;
    return { lat: avgLat, lng: avgLng };
  }, [initialLocation]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Set up markers for all providers
  useEffect(() => {
    const markers = providers.map(provider => ({
      id: provider.id,
      position: { lat: provider.latitude, lng: provider.longitude },
      category: provider.category,
      provider
    }));

    setFilteredMarkers(markers);

    // Update map view
    if (mapRef.current && providers.length > 0) {
      const center = calculateCenter(providers);
      mapRef.current.panTo(center);
      mapRef.current.setZoom(11);
    }
  }, [providers, calculateCenter]);

  // Handle marker drag start
  const handleMarkerDragStart = (marker: CustomMarker) => {
    if (editable) {
      setIsDragging(true);
      setDraggingMarker(marker);
    }
  };

  // Handle marker drag
  const handleMarkerDrag = (e: google.maps.MapMouseEvent) => {
    if (isDragging && draggingMarker && editable) {
      const newPosition = {
        lat: e.latLng?.lat() || 0,
        lng: e.latLng?.lng() || 0
      };
      setDraggingMarker({
        ...draggingMarker,
        position: newPosition
      });
    }
  };

  // Handle marker drag end
  const handleMarkerDragEnd = () => {
    if (isDragging && draggingMarker && editable) {
      setIsDragging(false);
      // Update provider location (this would typically update the database)
      console.log('Location updated:', draggingMarker.position);
      onLocationChange?.(draggingMarker.position);
      
      // Update the marker in the filtered list
      setFilteredMarkers(prev => 
        prev.map(marker => 
          marker.id === draggingMarker.id 
            ? { ...marker, position: draggingMarker.position }
            : marker
        )
      );
    }
    setDraggingMarker(null);
  };

  // Handle marker click
  const handleMarkerClick = (marker: CustomMarker) => {
    if (marker.provider) {
      setSelectedProvider(marker.provider);
      onProviderSelect?.(marker.provider);
    }
  };

  // Create custom marker icon
  const createCustomIcon = (category: Category, isSelected = false) => {
    const color = category.color || '#3b82f6';
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '48' : '32'}" height="${isSelected ? '48' : '32'}" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>
        <circle cx="12" cy="9" r="2" fill="white"/>
        <path d="M12 11v4" stroke="white" stroke-width="2"/>
        ${isSelected ? `<circle cx="12" cy="12" r="18" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="2,2"/>` : ''}
      </svg>
    `;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(isSelected ? 48 : 32, isSelected ? 48 : 32),
      anchor: new google.maps.Point(isSelected ? 24 : 16, isSelected ? 24 : 32)
    };
  };

  // Handle map click for custom location
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (editable && e.latLng && customLocation === null) {
      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setCustomLocation(newPosition);
      onLocationChange?.(newPosition);
    }
  };

  return (
    <div className="w-full relative" style={{ height }}>
      {/* Map Controls */}
      

          {/* User Location */}
          {userLocation && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                mapRef.current?.panTo(userLocation);
                mapRef.current?.setZoom(14);
              }}
              className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow flex items-center gap-2"
            >
              <Navigation className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">My Location</span>
            </motion.button>
          )}

          {/* Edit Mode Toggle */}
          {editable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCustomLocation(null)}
              className="bg-blue-500 text-white rounded-lg shadow-lg p-3 hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <EditLocation className="w-5 h-5" />
              <span className="text-sm font-medium">Add Location</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Custom Location Marker */}
      {customLocation && (
        <Marker
          position={customLocation}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#ef4444" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2" fill="white"/><path d="M12 11v4" stroke="white" stroke-width="2"/></svg>',
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }}
          onClick={() => setCustomLocation(null)}
        />
      )}

      {/* Google Map */}
      <GoogleMap
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        defaultZoom={11}
        defaultCenter={initialLocation}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        ref={mapRef}
        options={{
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
            fullscreenControl: false
        }}
        onClick={handleMapClick}
        onDrag={handleMarkerDrag}
        onDragEnd={handleMarkerDragEnd}
      >
        {/* Regular Markers */}
        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createCustomIcon(marker.category, selectedProvider?.id === marker.id)}
            onClick={() => handleMarkerClick(marker)}
            draggable={editable}
            onDragStart={() => handleMarkerDragStart(marker)}
            zIndex={selectedProvider?.id === marker.id ? 10 : 1}
          >
            {selectedProvider?.id === marker.id && (
              <InfoWindow
                position={marker.position}
                onCloseClick={() => setSelectedProvider(null)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 min-w-[280px]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{marker.provider?.name}</h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: marker.category.color ? `${marker.category.color}20` : '#dbeafe',
                            color: marker.category.color || '#3b82f6'
                          }}
                        >
                          {marker.category.name}
                        </span>
                        {marker.provider?.verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Close className="w-4 h-4" />
                    </button>
                  </div>

                  {marker.provider?.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {marker.provider.rating} ({marker.provider.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}

                  {marker.provider?.shortDesc && (
                    <p className="text-sm text-gray-600 mb-3">
                      {marker.provider.shortDesc}
                    </p>
                  )}

                  {marker.provider?.hourlyRate && (
                    <p className="text-lg font-semibold text-blue-600 mb-3">
                      ¥{marker.provider.hourlyRate}/hr
                    </p>
                  )}

                  <div className="flex gap-2">
                    {marker.provider?.phone && (
                      <a
                        href={`tel:${marker.provider.phone}`}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                    <a
                      href={`mailto:${marker.provider?.email}`}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </a>
                  </div>
                </motion.div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Dragging Indicator */}
        {isDragging && draggingMarker && (
          <InfoWindow
            position={draggingMarker.position}
            options={{ pixelOffset: new google.maps.Size(0, -40) }}
          >
            <div className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">
              <PinDrop className="inline w-4 h-4 mr-1" />
              Drop to set location
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Categories</h4>
        <div className="space-y-1">
          {categories.slice(0, 5).map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color || '#3b82f6' }}
              ></div>
              <span className="text-xs text-gray-600">{category.name}</span>
            </div>
          ))}
          {categories.length > 5 && (
            <div className="text-xs text-gray-500">+{categories.length - 5} more</div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2">
        <div className="text-sm text-gray-600">
          {filteredMarkers.length} {filteredMarkers.length === 1 ? 'Provider' : 'Providers'} found
        </div>
      </div>
    </div>
  );
}