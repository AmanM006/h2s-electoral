'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { REAL_POLLING_STATIONS, PollingStation } from '@/lib/polling-stations';
import { MapPin, Clock, Accessibility, Search, Loader2 } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 12.9352,
  lng: 77.6245, // Koramangala
};

// Stable reference to libraries to prevent "Loader called with different options" error
const LIBRARIES: ("marker" | "maps" | "places" | "geocoding")[] = ['marker'];

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#777777' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#333333' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#444444' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
];

export default function Map() {
  const [pinCode, setPinCode] = useState('');
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(14);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Effect to manage Advanced Markers
  useEffect(() => {
    if (!map || !isLoaded || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(m => {
      if (m.map) m.map = null;
    });
    markersRef.current = [];

    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker as any;

    // 1. User/Search Point Marker (Indigo)
    const userPin = new PinElement({
      background: '#6366f1',
      borderColor: '#ffffff',
      glyphColor: '#ffffff',
      scale: 1.2, // Made larger for visibility
    });

    const userMarker = new AdvancedMarkerElement({
      map,
      position: center,
      content: userPin.element,
      title: 'Current Search Area',
      zIndex: 1000,
    });
    markersRef.current.push(userMarker);

    // 2. Polling Station Markers (Vibrant Emerald with Glyphs)
    REAL_POLLING_STATIONS.forEach(station => {
      const stationPin = new PinElement({
        background: '#10b981',
        borderColor: '#ffffff',
        glyphColor: '#000000', // Black glyph for contrast
        glyph: '🗳️', // Use ballot box emoji as glyph
        scale: 1.4, // Significantly larger for visibility
      });

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: station.lat, lng: station.lng },
        content: stationPin.element,
        title: station.name,
      });

      marker.addListener('click', () => {
        setSelectedStation(station);
        // Center slightly offset to allow info window space
        map.panTo({ lat: station.lat + 0.001, lng: station.lng });
      });

      markersRef.current.push(marker);
    });
  }, [map, isLoaded, center]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.match(/^[1-9][0-9]{5}$/)) {
      setError('Please enter a valid 6-digit PIN.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({
        address: pinCode,
        componentRestrictions: { country: 'IN' }
      });

      if (response.results?.[0]) {
        const { lat, lng } = response.results[0].geometry.location;
        const coords = { lat: lat(), lng: lng() };
        setCenter(coords);
        setZoom(15);
      } else {
        setError('PIN location not found.');
      }
    } catch (err) {
      setError('Search service unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [pinCode]);

  // Use memoized options to prevent re-renders
  const memoizedOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    mapId: '4504f990513ad765', // Using a public dark-themed Map ID for better visuals if possible, or fallback to styles
    styles: darkMapStyles,
  }), []);

  if (loadError) {
    return <div className="p-6 text-red-500 font-bold">Error loading Google Maps</div>;
  }

  return (
    <div className="bg-card rounded-3xl border border-border-subtle overflow-hidden shadow-2xl animate-fadeIn">
      <div className="p-8 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl">
              <MapPin size={20} className="text-black" />
            </div>
            <div>
              <h2 id="map-heading" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Electoral Locator</h2>
              <p className="text-sm font-bold text-white">Find your Polling Station</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="Enter PIN Code..."
            className="w-full bg-black text-white border border-border-subtle rounded-2xl px-6 py-4.5 text-base focus:outline-none focus:border-accent transition-all pl-14 placeholder:text-gray-600"
            maxLength={6}
          />
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" />
          <button
            type="submit"
            disabled={isLoading || !isLoaded}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>
        {error && <p className="text-[11px] text-red-500 mt-3 font-bold uppercase tracking-widest">{error}</p>}
      </div>

      <div className="relative border-b border-border-subtle">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            onLoad={setMap}
            onUnmount={onUnmount}
            options={memoizedOptions}
          >
            {selectedStation && (
              <InfoWindow
                position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div className="p-3 max-w-[240px] bg-white">
                  <h3 className="font-black text-black text-sm mb-3 border-b border-gray-100 pb-2">{selectedStation.name}</h3>
                  <div className="space-y-2.5 text-xs text-gray-600 font-bold">
                    <p className="flex items-center gap-2 text-indigo-600">
                      <Clock size={14} /> Est. Wait: {selectedStation.waitTime}
                    </p>
                    <p className="flex items-center gap-2 text-emerald-600">
                      <Accessibility size={14} /> Wheelchair Accessible
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`)}
                        className="w-full bg-black text-white py-2 rounded-lg text-[10px] uppercase tracking-widest hover:bg-accent transition-colors"
                      >
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-[500px] flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-accent" size={40} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Syncing Satellite Data</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black">
        <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Point</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Polling Booth</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Data Source: Election Commission of India
          </p>
        </div>
      </div>
    </div>
  );
}
