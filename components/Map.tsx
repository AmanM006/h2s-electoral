'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629, // Center of India
};

/**
 * Map component that allows users to find a polling station by PIN code.
 * It uses the Google Maps Geocoding API to convert the PIN code to coordinates.
 * 
 * @returns The interactive Map component.
 */
export default function Map() {
  const [pinCode, setPinCode] = useState('');
  const [location, setLocation] = useState(defaultCenter);
  const [zoom, setZoom] = useState(5);
  const [error, setError] = useState('');
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  /**
   * Handles the search form submission.
   * Calls the Geocoding API to find the location for the given PIN code.
   * 
   * @param e The form event.
   */
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.match(/^[1-9][0-9]{5}$/)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    setError('');
    setIsLoadingGeocode(true);

    try {
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps API is not loaded yet.');
      }

      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({
        address: pinCode,
        componentRestrictions: { country: 'IN' }
      });

      if (response.results && response.results.length > 0) {
        const { lat, lng } = response.results[0].geometry.location;
        setLocation({ lat: lat(), lng: lng() });
        setZoom(14);
      } else {
        setError('Could not find location for this PIN code.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to geocode PIN code.');
    } finally {
      setIsLoadingGeocode(false);
    }
  }, [pinCode]);

  return (
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
          disabled={!isLoaded || isLoadingGeocode}
        />
        <button
          type="submit"
          aria-label="Search Polling Station"
          disabled={!isLoaded || isLoadingGeocode}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          {isLoadingGeocode ? 'Searching...' : 'Search'}
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
  );
}
