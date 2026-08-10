/**
 * useCompanyCareers.js
 *
 * Fetches companies with verified career pages via GET /api/company-careers.
 * Reuses placesSlice for location + filter state only.
 */
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLocationStatus,
  setLocationGranted,
  setLocationDenied,
  setLocationError,
} from "../redux/placesSlice";
import { getCompanyCareers } from "../services/companyCareersService";

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(`${NOMINATIM}?lat=${lat}&lon=${lon}&format=json`, {
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

export default function useCompanyCareers() {
  const dispatch = useDispatch();
  const location = useSelector(s => s.places.location);
  const filters  = useSelector(s => s.places.filters);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [source, setSource]       = useState(null);

  const doFetch = useCallback(async ({ lat, lon, city, keyword, radius }) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (lat != null && lon != null) {
        res = await getCompanyCareers({
          lat,
          lon,
          radius:  radius ?? 15,
          keyword: keyword ?? "software company",
          city:    city?.trim() || undefined,
        });
      } else if (city?.trim()) {
        res = await getCompanyCareers({
          lat,
          lon,
          city:    city.trim(),
          keyword: keyword ?? "software company",
          radius:  radius ?? 15,
        });
      } else {
        setCompanies([]);
        setSource("no_location");
        setLoading(false);
        return;
      }

      const list = Array.isArray(res.data) ? res.data : (res.data?.companies || []);
      setCompanies(list);
      setSource("company_careers");
    } catch (e) {
      const payload = e?.response?.data || { reason: e.message || "Failed to load career pages" };
      setError(typeof payload === "string" ? payload : payload.reason || payload.message || "Failed to load");
      setCompanies([]);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
        doFetch({
          lat,
          lon,
          keyword: filters.keyword,
          radius:  filters.maxRadius,
        });
      },
      (err) => {
        console.warn("[useCompanyCareers] Geolocation denied:", err.message);
        dispatch(setLocationDenied(err.message));
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [dispatch, doFetch, filters.keyword, filters.maxRadius]);

  const fetchByCity = useCallback((city, keyword) => {
    doFetch({
      lat:     location.lat,
      lon:     location.lon,
      city,
      keyword: keyword ?? filters.keyword ?? "software company",
      radius:  filters.maxRadius ?? 15,
    });
  }, [doFetch, location.lat, location.lon, filters.keyword, filters.maxRadius]);

  const refetch = useCallback(() => {
    const effectiveCity = location.city || filters.city;
    doFetch({
      lat:     location.lat,
      lon:     location.lon,
      city:    effectiveCity,
      keyword: filters.keyword ?? "software company",
      radius:  filters.maxRadius ?? 15,
    });
  }, [doFetch, location, filters]);

  return {
    companies,
    loading,
    error,
    source,
    requestLocation,
    fetchByCity,
    refetch,
  };
}
