import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeocodeResult } from '../../types';
import { MapPin, Compass } from 'lucide-react';

// Custom modern SVG marker matching AtlasIQ brand
const createAtlasMarkerIcon = (isHighlight: boolean = true) => {
  const color = isHighlight ? '#2563eb' : '#0d9488';
  return L.divIcon({
    className: 'atlasiq-map-marker',
    html: `
      <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 32" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(15, 23, 42, 0.35));">
          <path d="M12 0C5.372 0 0 5.372 0 12c0 9 12 20 12 20s12-11 12-20c0-6.628-5.372-12-12-12z" fill="${color}"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff"/>
          <circle cx="12" cy="11" r="2.5" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  });
};

// Map controller to smoothly handle pan, zoom, and container resize
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.2,
    });
    // Invalidate size to guarantee tiles align after container resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  return null;
}

interface LocationMapProps {
  selectedLocation: GeocodeResult | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  height?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  selectedLocation,
  isLoading = false,
  error = null,
  className = '',
  height = '460px',
}) => {
  const markerRef = useRef<L.Marker | null>(null);

  // Default world view when no location selected
  const defaultCenter: [number, number] = [20, 15];
  const defaultZoom = 2;

  const activeCenter: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : defaultCenter;

  const activeZoom = selectedLocation ? 11 : defaultZoom;

  // Auto-open marker popup when location is selected
  useEffect(() => {
    if (selectedLocation && markerRef.current) {
      const timer = setTimeout(() => {
        markerRef.current?.openPopup();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100 ${className}`}
      style={{ height }}
    >
      {/* Real Interactive Leaflet Map */}
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 10 }}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController center={activeCenter} zoom={activeZoom} />

        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={createAtlasMarkerIcon(true)}
            ref={markerRef}
          >
            <Popup className="atlasiq-map-popup">
              <div className="p-1 space-y-1.5 text-slate-900 max-w-xs font-sans">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedLocation.name}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                  {selectedLocation.displayName}
                </p>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Lat: {selectedLocation.lat.toFixed(4)}°</span>
                  <span>Lng: {selectedLocation.lng.toFixed(4)}°</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Coordinate HUD overlay */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs text-slate-700">
          <Compass className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          {selectedLocation ? (
            <span className="font-mono text-[11px]">
              {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Global Coordinate Canvas</span>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-900/20 backdrop-blur-2xs flex items-center justify-center pointer-events-auto">
          <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-slate-800">Resolving location & telemetry...</span>
          </div>
        </div>
      )}

      {/* Error Overlay Notice */}
      {error && (
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto">
          <div className="bg-rose-50/95 border border-rose-200 text-rose-900 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 shadow-xs">
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
