/**
 * companyCareersService.js
 *
 * GET /api/company-careers — companies with verified career pages
 */
import api from "./api";

/**
 * @param {object} params
 * @param {number} [params.lat]
 * @param {number} [params.lon]
 * @param {number} [params.radius=15]
 * @param {string} [params.keyword="software company"]
 * @param {string} [params.city]
 */
export const getCompanyCareers = ({ lat, lon, radius = 15, keyword = "software company", city }) =>
  api.get("/company-careers", {
    params: {
      ...(lat != null && { lat }),
      ...(lon != null && { lon }),
      radius,
      keyword,
      ...(city?.trim() && { city: city.trim() }),
    },
    timeout: 300000,
  });
