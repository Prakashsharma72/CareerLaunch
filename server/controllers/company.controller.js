import { searchCompanies } from "../services/company.service.js";
import Company from "../models/company.model.js";

/**
 * GET /api/companies/search
 * Query params: keyword, city
 */
export const searchCompaniesHandler = async (req, res) => {
  try {
    const { keyword, city } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ message: "keyword is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ message: "city is required" });
    }

    const companies = await searchCompanies({
      keyword: keyword.trim(),
      city: city.trim(),
    });

    return res.status(200).json(companies);
  } catch (error) {
    console.error("searchCompanies error:", error.message);

    // Surface a clean message when the API key is missing
    if (error.message.includes("GOOGLE_MAPS_API_KEY")) {
      return res.status(503).json({
        message: "Google Maps API key is not configured on the server.",
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/companies
 * Returns all companies stored in the DB (latest first)
 */
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(companies);
  } catch (error) {
    console.error("getAllCompanies error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
