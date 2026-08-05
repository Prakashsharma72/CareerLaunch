/**
 * usePlaces.js  — rebuilt
 *
 * Fixed:
 *  1. fetchingRef stale-closure bug removed — use local variable instead
 *  2. doFetch no longer captures filters in closure — accepts all params explicitly
 *  3. fetchByCity passes the current keyword correctly
 *  4. Keyword param is separate from client-side name filter
 */
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLocationStatus,
  setLocationGranted,
  setLocationDenied,
  setLocationError,
  fetchStart,
  fetchSuccess,
  fetchFailure,
} from "../redux/placesSlice";
import { getNearbyCompanies, searchCompaniesByCity } from "../services/placesService";

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

async function reverseGeocode(lat, lon) {
  try {
    const r    = await fetch(`${NOMINATIM}?lat=${lat}&lon=${lon}&format=json`, {
      headers: { "User-Agent": "CareerLaunchAI/2.0" },
    });
    const data = await r.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
    const state = addr.state || "";
    return { city, fullCity: [city, state].filter(Boolean).join(", ") };
  } catch {
    return { city: null, fullCity: null };
  }
}

export default function usePlaces() {
  const dispatch = useDispatch();
  const location = useSelector(s => s.places.location);
  const filters  = useSelector(s => s.places.filters);

  /* ── Core fetch — all params explicit, no stale closure ──────── */
  const doFetch = useCallback(async ({ lat, lon, city, keyword, radius }) => {
    dispatch(fetchStart());
    try {
      let res;
      if (lat != null && lon != null) {
        res = await getNearbyCompanies(lat, lon, radius ?? 15, keyword ?? "software company");
      } else if (city?.trim()) {
        res = await searchCompaniesByCity(keyword ?? "software company", city.trim(), lat, lon);
      } else {
        dispatch(fetchSuccess({ companies: [], total: 0, source: "no_location" }));
        return;
      }
      dispatch(fetchSuccess(res.data));
    } catch (e) {
      const payload = e?.response?.data || { reason: e.message || "Failed to fetch companies" };
      dispatch(fetchFailure(payload));
    }
  }, [dispatch]);

  /* ── GPS request ─────────────────────────────────────────────── */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch(setLocationError("Geolocation is not supported by your browser."));
      return;
    }
    dispatch(setLocationStatus("requesting"));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const { city, fullCity } = await reverseGeocode(lat, lon);
        dispatch(setLocationGranted({ lat, lon, city, fullCity }));
        // Read current filter values at call time (not stale closure)
        const currentFilters = filters;
        doFetch({ lat, lon, keyword: currentFilters.keyword, radius: currentFilters.maxRadius });
      },
      (err) => {
        console.warn("[usePlaces] Geolocation denied:", err.message);
        dispatch(setLocationDenied(err.message));
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [dispatch, doFetch, filters]);

  /* ── fetchByCity — triggered by city Search button ───────────── */
  const fetchByCity = useCallback((city, keyword) => {
    // Use GPS coords if available for distance calculation
    const lat = location.lat;
    const lon = location.lon;
    const kw  = keyword ?? filters.keyword ?? "software company";
    const rad = filters.maxRadius ?? 15;
    doFetch({ lat, lon, city, keyword: kw, radius: rad });
  }, [doFetch, location.lat, location.lon, filters.keyword, filters.maxRadius]);

  /* ── refetch — re-run with current location + filters ────────── */
  const refetch = useCallback(() => {
    const { lat, lon, city } = location;
    const effectiveCity = city || filters.city;
    doFetch({
      lat,
      lon,
      city:    effectiveCity,
      keyword: filters.keyword ?? "software company",
      radius:  filters.maxRadius ?? 15,
    });
  }, [doFetch, location, filters]);

  return { requestLocation, fetchByCity, refetch, doFetch };
}
