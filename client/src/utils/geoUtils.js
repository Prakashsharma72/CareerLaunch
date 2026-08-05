/**
 * geoUtils.js  (simplified)
 *
 * Pure geometry helpers used across the app.
 * All location-based filtering is now handled server-side
 * (Google Places API) — this file only keeps the math utilities
 * that components still reference directly.
 */

/* ── Haversine distance (km) ─────────────────────────────────────────── */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R   = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Format a km distance for display ──────────────────────────────── */
export function formatKm(km) {
  if (km == null) return null;
  if (km < 1)    return `${(km * 1000).toFixed(0)} m`;
  if (km < 10)   return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
