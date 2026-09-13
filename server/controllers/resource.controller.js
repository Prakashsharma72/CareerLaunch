import Resource from "../models/resource.model.js";
import { normalizeResourceCategory } from "../constants/resourceCategories.js";

const RESOURCE_TYPES = ["Video", "Article", "Course", "Documentation", "PDF"];
const RESOURCE_STATUSES = ["draft", "published"];

const serializeResource = (resource) => {
  const value = resource.toJSON ? resource.toJSON() : resource;
  return { ...value, category: normalizeResourceCategory(value.category) || value.category };
};

const resourcePayload = (body, file, existingResource = null) => {
  const category = normalizeResourceCategory(body.category);
  const link = file?.path || body.link || existingResource?.link || existingResource?.fileUrl || null;
  if (!category) throw Object.assign(new Error("A valid resource category is required"), { status: 400 });
  if (!body.title || !body.description || !body.resourceType || !RESOURCE_TYPES.includes(body.resourceType)) {
    throw Object.assign(new Error("Title, description, and a valid resource type are required"), { status: 400 });
  }
  if (!link) throw Object.assign(new Error("Provide a URL or upload a file"), { status: 400 });
  if (body.status && !RESOURCE_STATUSES.includes(body.status)) {
    throw Object.assign(new Error("Invalid publication status"), { status: 400 });
  }
  return {
    title: body.title.trim(),
    description: body.description.trim(),
    category,
    resourceType: body.resourceType,
    link,
    fileUrl: file?.path || body.fileUrl || null,
    fileName: file?.originalname || body.fileName || existingResource?.fileName || null,
    fileMimeType: file?.mimetype || body.fileMimeType || existingResource?.fileMimeType || null,
    status: body.status || "published",
  };
};

/**
 * ADD RESOURCE (ADMIN)
 */
export const addResource = async (req, res) => {
  try {
    const resource = await Resource.create(resourcePayload(req.body, req.file));
    res.status(201).json(resource);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * GET ALL RESOURCES
 */
export const getResources = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const resources = await Resource.findAll({
      where: { status: "published" },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(resources.map(serializeResource));
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

export const getAdminResources = async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const resources = await Resource.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(resources.map(serializeResource));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    await resource.update(resourcePayload(req.body, req.file, resource));
    res.status(200).json(serializeResource(resource));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};