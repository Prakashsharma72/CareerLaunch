/**
 * savedCompany.controller.js
 *
 * POST   /api/saved-companies        — bookmark a company (inline data)
 * GET    /api/saved-companies        — get user's bookmarks from MySQL
 * DELETE /api/saved-companies/:id    — remove a bookmark
 *
 * NO foreign key to companies table. All company data is stored inline
 * at the time the user clicks bookmark.
 */
import SavedCompany from "../models/savedCompany.model.js";

const LOG = "[savedCompany.ctrl]";
const log = (msg, d) =>
  console.log(`${new Date().toISOString()} ${LOG} ${msg}`, d ?? "");

/* ── Save ────────────────────────────────────────────────────────────────── */

/**
 * POST /api/saved-companies
 * Body: { externalCompanyId, source, companyName, logo, website,
 *         address, phone, rating, mapsUrl, careerPage, industry, city }
 */
export const saveCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      externalCompanyId, source, companyName, logo, website,
      address, phone, rating, mapsUrl, careerPage, industry, city,
    } = req.body;

    if (!externalCompanyId) {
      return res.status(400).json({ message: "externalCompanyId is required" });
    }
    if (!companyName) {
      return res.status(400).json({ message: "companyName is required" });
    }

    const [record, created] = await SavedCompany.findOrCreate({
      where:    { userId, externalCompanyId: String(externalCompanyId) },
      defaults: {
        userId,
        externalCompanyId: String(externalCompanyId),
        source:      source      || null,
        companyName: companyName || null,
        logo:        logo        || null,
        website:     website     || null,
        address:     address     || null,
        phone:       phone       || null,
        rating:      rating      || null,
        mapsUrl:     mapsUrl     || null,
        careerPage:  careerPage  || null,
        industry:    industry    || null,
        city:        city        || null,
      },
    });

    if (!created) {
      return res.status(409).json({ message: "Company already saved", savedId: record.id });
    }

    log(`Saved company "${companyName}" for user ${userId}`);
    return res.status(201).json({
      message: "Company saved successfully",
      savedId: record.id,
    });
  } catch (err) {
    console.error(`${LOG} saveCompany error:`, err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── Get all saved ───────────────────────────────────────────────────────── */

export const getSavedCompanies = async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await SavedCompany.findAll({
      where:  { userId },
      order:  [["createdAt", "DESC"]],
    });

    const result = rows.map(r => ({
      savedId:           r.id,
      id:                r.externalCompanyId || String(r.id),
      externalCompanyId: r.externalCompanyId,
      source:            r.source,
      companyName:       r.companyName,
      logo:              r.logo,
      website:           r.website,
      address:           r.address,
      phone:             r.phone,
      rating:            r.rating,
      mapsUrl:           r.mapsUrl,
      careerPage:        r.careerPage,
      industry:          r.industry,
      city:              r.city,
      dataSource:        r.source,
    }));

    log(`Returned ${result.length} saved companies for user ${userId}`);
    return res.status(200).json(result);
  } catch (err) {
    console.error(`${LOG} getSavedCompanies error:`, err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── Remove ──────────────────────────────────────────────────────────────── */

/**
 * DELETE /api/saved-companies/:id
 * :id is the saved_companies.id (the bookmark row id)
 */
export const removeSavedCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await SavedCompany.destroy({
      where: { id, userId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Saved company not found" });
    }

    log(`Removed saved company id=${id} for user ${userId}`);
    return res.status(200).json({ message: "Company removed from saved list" });
  } catch (err) {
    console.error(`${LOG} removeSavedCompany error:`, err.message);
    return res.status(500).json({ message: err.message });
  }
};
