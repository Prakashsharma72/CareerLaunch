/**
 * companyCareersService.js
 *
 * GET /api/company-careers — software companies with optional career enrichment
 */
import api from "./api";

/**
 * @param {object} params
 * @param {number} [params.lat]
 * @param {number} [params.lon]
 * @param {number} [params.radius=15]
 * @param {string} [params.keyword="software company"]
 * @param {string} [params.city]
 * @param {string} [params.pageToken]
 */
export const getCompanyCareers = ({ lat, lon, radius = 15, keyword = "software company", city, pageToken }) =>
  api.get("/company-careers", {
    params: {
      ...(lat != null && { lat }),
      ...(lon != null && { lon }),
      radius,
      keyword,
      ...(city?.trim() && { city: city.trim() }),
      ...(pageToken && { pageToken }),
    },
    timeout: 300000,
  });
