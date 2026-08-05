/**
 * useGeolocation.js
 *
 * Requests browser location, reverse-geocodes to city via Nominatim.
 *
 * Key improvements over previous version:
 *  - Coords are persisted to sessionStorage so they survive React re-renders
 *    and hot-reloads without re-prompting the user.
 *  - `autoRequest` option (default false) — set true to trigger the prompt
 *    on first mount (used by Jobs page on startup).
 *  - coords is always an object { lat, lon } or null — never undefined.
 *  - status transitions are logged so the caller can debug easily.
 *
 * Returns:
 *   {
 *     status:   "idle" | "requesting" | "granted" | "denied" | "error"
 *     city:     string | null        — short name: "Pune"
 *     fullCity: string | null        — "Pune, Maharashtra"
 *     coords:   { lat: number, lon: number } | null
 *     error:    string | null
 *     request:  () => void           — imperatively trigger the prompt
 *   }
 */
import { useState, useCallback, useEffect, useRef } from "react";

const NOMINATIM   = "https://nominatim.openstreetmap.org/reverse";
const SESSION_KEY = "cl_geo";   // sessionStorage key

const log = (msg, data) =>
  console.log(`[useGeolocation] ${msg}`, data !== undefined ? data : "");

/* ── Persist / restore from sessionStorage ─────────────────────────────── */
function saveSession(payload) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload)); } catch {}
}
function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Reverse geocode via Nominatim ─────────────────────────────────────── */
async function reverseGeocode(lat, lon) {
  try {
    const res  = await fetch(
      `${NOMINATIM}?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "CareerLaunchAI/1.0" } }
    );
    const data = await res.json();
    const a    = data.address || {};
    const city  = a.city || a.town || a.village || a.county || a.state_district || "";
    const state = a.state || "";
    const full  = city ? (state ? `${city}, ${state}` : city) : state || null;
    const short = city || state || null;
    log("Reverse geocode result", { lat, lon, short, full });
    return { full, short };
  } catch (e) {
    log("Reverse geocode failed", e.message);
    return { full: null, short: null };
  }
}

/* ── Hook ───────────────────────────────────────────────────────────────── */
export default function useGeolocation({ autoRequest = false } = {}) {
  // Initialise from sessionStorage so coords survive hot-reload / re-mounts
  const session = loadSession();

  const [status,   setStatus]   = useState(session ? "granted" : "idle");
  const [city,     setCity]     = useState(session?.city     ?? null);
  const [fullCity, setFullCity] = useState(session?.fullCity ?? null);
  const [coords,   setCoords]   = useState(session ? { lat: session.lat, lon: session.lon } : null);
  const [error,    setError]    = useState(null);

  // Prevent double-requesting
  const requestingRef = useRef(false);

  const request = useCallback(() => {
    if (requestingRef.current) return;
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported by your browser.");
      log("Geolocation not supported");
      return;
    }

    requestingRef.current = true;
    setStatus("requesting");
    setError(null);
    log("Requesting browser location…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        log("Position received", { lat, lon });

        // Set coords FIRST so callers that re-run on status change get them immediately
        const coordsObj = { lat, lon };
        setCoords(coordsObj);
        setStatus("granted");

        const { full, short } = await reverseGeocode(lat, lon);
        setCity(short);
        setFullCity(full);

        // Persist for this browser session
        saveSession({ lat, lon, city: short, fullCity: full });
        log("Location granted + geocoded", { lat, lon, city: short });

        requestingRef.current = false;
      },
      (err) => {
        const isDenied = err.code === 1;
        setStatus(isDenied ? "denied" : "error");
        setError(
          isDenied
            ? "Location access denied. You can type your city manually."
            : "Could not determine your location."
        );
        log(isDenied ? "Location denied" : "Location error", err.message);
        requestingRef.current = false;
      },
      { timeout: 12000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false }
    );
  }, []);

  // Auto-request on mount when caller opts in and we have no cached session
  useEffect(() => {
    if (autoRequest && !session) {
      request();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, city, fullCity, coords, error, request };
}
