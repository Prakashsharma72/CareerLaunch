/**
 * usePlaces.js  — rebuilt
 *
 * Fixed:
 *  1. fetchingRef stale-closure bug removed — use local variable instead
 *  2. doFetch no longer captures filters in closure — accepts all params explicitly
 *  3. fetchByCity passes the current keyword correctly
 *  4. Keyword param is separate from client-side name filter
 */
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLocationStatus,
  setLocationGranted,
  setLocationDenied,
  setLocationError,
  fetchStart,
  fetchSuccess,
  fetchFailure,
  appendFetchStart,
  appendFetchSuccess,
  setFilter,
  setPage,
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
  const page = useSelector(s => s.places.page);
  const requestVersion = useRef(0);

  /* ── Core fetch — all params explicit, no stale closure ──────── */
  const doFetch = useCallback(async ({ mode, lat, lon, city, keyword, radius, batchIndex = 0, append = false, version }) => {
    const currentVersion = version ?? ++requestVersion.current;
    const searchKeyword = keyword?.trim() || "software company";
    const searchRadius = radius ?? 15;
    dispatch(append ? appendFetchStart() : fetchStart());
    try {
      let res;
      if (mode === "city" && city?.trim()) {
        res = await searchCompaniesByCity({
          city: city.trim(),
          keyword: searchKeyword,
          radius: searchRadius,
          batchIndex,
        });
      } else if (mode === "nearby" && lat != null && lon != null) {
        res = await getNearbyCompanies(lat, lon, searchRadius, searchKeyword, batchIndex);
      } else {
        dispatch(fetchSuccess({ companies: [], total: 0, source: "no_location" }));
        return;
      }
      if (currentVersion !== requestVersion.current) return;
      dispatch(append ? appendFetchSuccess(res.data) : fetchSuccess(res.data));
    } catch (e) {
      if (currentVersion !== requestVersion.current) return;
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
    const version = ++requestVersion.current;
    dispatch(setLocationStatus("requesting"));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const { city, fullCity } = await reverseGeocode(lat, lon);
        if (version !== requestVersion.current) return;
        dispatch(setLocationGranted({ lat, lon, city, fullCity }));
        // Read current filter values at call time (not stale closure)
        const currentFilters = filters;
        doFetch({ mode: "nearby", lat, lon, keyword: currentFilters.keyword, radius: currentFilters.maxRadius, version });
      },
      (err) => {
        if (version !== requestVersion.current) return;
        console.warn("[usePlaces] Geolocation denied:", err.message);
        dispatch(setLocationDenied(err.message));
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [dispatch, doFetch, filters]);

  /* ── fetchByCity — triggered by city Search button ───────────── */
  const fetchByCity = useCallback((city, keyword) => {
    const trimmedCity = city?.trim();
    if (!trimmedCity) return;
    const kw  = keyword?.trim() || filters.keyword || "software company";
    const rad = filters.maxRadius ?? 15;
    const version = ++requestVersion.current;
    dispatch(setFilter({ batchIndex: 0 }));
    doFetch({ mode: "city", city: trimmedCity, keyword: kw, radius: rad, version });
  }, [dispatch, doFetch, filters.keyword, filters.maxRadius]);

  /* ── refetch — re-run with current location + filters ────────── */
  const refetch = useCallback(() => {
    const { lat, lon } = location;
    const effectiveCity = filters.city || (location.status === "manual" ? location.city : null);
    if (effectiveCity?.trim()) {
      doFetch({ mode: "city", city: effectiveCity.trim(), keyword: filters.keyword ?? "software company", radius: filters.maxRadius ?? 15 });
      return;
    }
    doFetch({ mode: "nearby", lat, lon, keyword: filters.keyword ?? "software company", radius: filters.maxRadius ?? 15 });
  }, [doFetch, location, filters]);

  const loadMore = useCallback(() => {
    const nextBatch = Number(filters.batchIndex || 0) + 1;
    if (nextBatch >= 4 || (!location.city && location.lat == null)) return;
    dispatch({ type: "places/setFilter", payload: { batchIndex: nextBatch } });
    dispatch(setPage(page + 1));
    doFetch({
      mode: filters.city ? "city" : "nearby",
      lat: location.lat,
      lon: location.lon,
      city: location.city || filters.city,
      keyword: filters.keyword,
      radius: filters.maxRadius,
      batchIndex: nextBatch,
      append: true,
    });
  }, [dispatch, doFetch, filters, location, page]);

  return { requestLocation, fetchByCity, refetch, doFetch, loadMore };
}
