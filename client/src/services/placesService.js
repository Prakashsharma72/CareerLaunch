/**
 * placesService.js
 *
 * Client-side wrapper for the /api/places backend endpoints.
 *
 * getNearbyCompanies(lat, lon, radius, keyword)
 *   POST /api/places/nearby
 *
 * searchCompaniesByCity(keyword, city, lat?, lon?)
 *   GET  /api/places/search?keyword=...&city=...&lat=...&lon=...
 *
 * getCompanyDetails(placeId)
 *   GET  /api/places/:placeId
 */
import api from "./api";

/**
 * GPS-based search — returns companies sorted nearest-first.
 * @param {number}  lat
 * @param {number}  lon
 * @param {number}  [radius=15]   km radius
 * @param {string}  [keyword]     default "software company"
 */
export const getNearbyCompanies = (lat, lon, radius = 15, keyword = "software company") =>
  api.post("/places/nearby", { lat, lon, radius, keyword });

/**
 * City text search — geocodes the city then searches Google Places.
 * @param {string}  keyword
 * @param {string}  city
 * @param {number}  [lat]   optional user coords (improves distance display)
 * @param {number}  [lon]
 */
export const searchCompaniesByCity = (keyword, city, lat, lon) =>
  api.get("/places/search", {
    params: {
      keyword,
      city,
      ...(lat != null && { lat }),
      ...(lon != null && { lon }),
    },
  });

/**
 * Full company details including photos, reviews, opening hours.
 * @param {string} placeId  Google place_id
 */
export const getCompanyDetails = (placeId) =>
  api.get(`/places/${encodeURIComponent(placeId)}`);
