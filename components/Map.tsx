'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

const center = {
  lat: 20.5937,
  lng: 78.9629, // Center of India
};

export default function Map() {
  const [pinCode, setPinCode] = useState('');
  const [location, setLocation] = useState(center);
  const [zoom, setZoom] = useState(5);
  const [error, setError] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.match(/^[1-9][0-9]{5}$/)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    setError('');
    
    // In a real app, we would use Geocoding API to get exact lat/lng from the pin code.
    // For this mockup, we'll generate a random location within India based on the pin code to simulate finding a polling station.
    const pseudoLat = 20 + (parseInt(pinCode.substring(0, 3)) % 10) - 5;
    const pseudoLng = 78 + (parseInt(pinCode.substring(3, 6)) % 10) - 5;
    
    setLocation({ lat: pseudoLat, lng: pseudoLng });
    setZoom(12);
  }, [pinCode]);

  return (
    <section aria-labelledby="map-heading" className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
          <h2 id="map-heading" className="text-2xl font-bold text-white mb-4">
            Find Sample Polling Station
          </h2>
          
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="Enter 6-digit PIN code (e.g. 110001)"
              aria-label="Enter PIN code"
              className="flex-1 bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              maxLength={6}
            />
            <button
              type="submit"
              aria-label="Search Polling Station"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              Search
            </button>
          </form>
          
          {error && <p className="text-red-400 mb-4" role="alert">{error}</p>}

          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner relative z-0">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location}
                zoom={zoom}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                {zoom > 5 && (
                  <Marker
                    position={location}
                    title={`Sample Polling Station for ${pinCode}`}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
                Loading Map...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
