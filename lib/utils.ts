/**
 * Spatial and Google Maps utility functions for Civic Copilot.
 *
 * Provides helpers for distance calculations and route data formatting
 * used alongside the Google Maps integration.
 *
 * @module lib/utils
 */

/**
 * Calculates the Haversine distance between two geographic coordinates.
 * Used to estimate straight-line distance between a user and a polling station.
 *
 * @param lat1 - Latitude of the first point in decimal degrees.
 * @param lon1 - Longitude of the first point in decimal degrees.
 * @param lat2 - Latitude of the second point in decimal degrees.
 * @param lon2 - Longitude of the second point in decimal degrees.
 * @returns Distance in kilometres between the two points.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a Google Maps Directions API route response into a
 * human-readable summary string.
 *
 * @param routeData - The route object returned by the Google Maps Directions API.
 * @returns A formatted string describing the route legs.
 */
export function formatGoogleMapsRoute(
  routeData: google.maps.DirectionsRoute
): string {
  if (!routeData || !routeData.legs || routeData.legs.length === 0) {
    return 'No route data available.';
  }

  return routeData.legs
    .map((leg, index) => {
      const distance = leg.distance?.text ?? 'unknown distance';
      const duration = leg.duration?.text ?? 'unknown duration';
      return `Leg ${index + 1}: ${leg.start_address} → ${leg.end_address} (${distance}, ${duration})`;
    })
    .join('\n');
}
