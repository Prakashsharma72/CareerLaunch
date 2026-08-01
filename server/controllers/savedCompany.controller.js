import SavedCompany from "../models/savedCompany.model.js";
import Company from "../models/company.model.js";

/**
 * POST /api/saved-companies
 * Body: { companyId }
 * Save a company for the authenticated user.
 */
export const saveCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // findOrCreate prevents duplicate saves
    const [saved, created] = await SavedCompany.findOrCreate({
      where: { userId, companyId },
    });

    if (!created) {
      return res.status(409).json({ message: "Company already saved" });
    }

    return res.status(201).json({
      message: "Company saved successfully",
      savedId: saved.id,
    });
  } catch (error) {
    console.error("saveCompany error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/saved-companies
 * Returns all companies saved by the authenticated user.
 */
export const getSavedCompanies = async (req, res) => {
  try {
    const userId = req.user.id;

    const saved = await SavedCompany.findAll({
      where: { userId },
      include: [
        {
          model: Company,
          as: "company",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Flatten: return the company data with the saved-record id
    const result = saved.map((s) => ({
      savedId: s.id,
      ...s.company.toJSON(),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("getSavedCompanies error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/saved-companies/:id
 * :id is the SavedCompany record id (not the Company id).
 */
export const removeSavedCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const saved = await SavedCompany.findOne({
      where: { id, userId },
    });

    if (!saved) {
      return res.status(404).json({ message: "Saved company not found" });
    }

    await saved.destroy();

    return res.status(200).json({ message: "Company removed from saved list" });
  } catch (error) {
    console.error("removeSavedCompany error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
