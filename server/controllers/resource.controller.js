import Resource from "../models/resource.model.js";

/**
 * ADD RESOURCE (ADMIN)
 */
export const addResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL RESOURCES
 */
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE RESOURCE
 */
export const deleteResource = async (req, res) => {
  try {
    const deleted = await Resource.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Resource not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};