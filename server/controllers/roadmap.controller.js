import { Op } from "sequelize";
import axios from "axios";
import sequelize from "../config/db.js";
import Roadmap from "../models/roadmap.model.js";
import RoadmapStep from "../models/roadmapStep.model.js";
import RoadmapResource from "../models/roadmapResource.model.js";
import RoadmapProgress from "../models/roadmapProgress.model.js";
import cloudinary from "../config/cloudinary.js";

Roadmap.hasMany(RoadmapStep, { foreignKey: "roadmapId", as: "steps" });
RoadmapStep.belongsTo(Roadmap, { foreignKey: "roadmapId" });
RoadmapStep.hasMany(RoadmapResource, { foreignKey: "stepId", as: "resources" });
RoadmapResource.belongsTo(RoadmapStep, { foreignKey: "stepId" });

const CATEGORIES = ["Web Development", "Backend", "Data Science", "DevOps", "Mobile", "AI / ML", "Cyber Security"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const RESOURCE_RULES = {
  Documentation: { extensions: [".pdf", ".doc", ".docx", ".txt"], mimes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"] },
  Video: { extensions: [".mp4", ".webm"], mimes: ["video/mp4", "video/webm"] },
  Article: { extensions: [".pdf", ".txt"], mimes: ["application/pdf", "text/plain"] },
  Exercise: { extensions: [".pdf", ".doc", ".docx", ".txt", ".zip"], mimes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/zip", "application/x-zip-compressed"] },
};

const parseJson = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

const validateUrl = (value) => {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol); } catch { return false; }
};

const normalizeSteps = (value, { publishing = false } = {}) => {
  const steps = parseJson(value);
  if (!Array.isArray(steps)) throw new Error("Steps must be an array.");
  const normalized = steps.map((step, index) => {
    const resources = parseJson(step.resources).map((resource) => ({
      id: resource.id ? Number(resource.id) : undefined,
      label: String(resource.label || "").trim(),
      type: String(resource.type || "Article").trim(),
      sourceType: resource.sourceType === "file" ? "file" : "link",
      url: String(resource.url || "").trim(),
      storagePublicId: resource.storagePublicId || null,
      originalName: resource.originalName || null,
      mimeType: resource.mimeType || null,
      fileSize: resource.fileSize ? Number(resource.fileSize) : null,
      resourceType: resource.resourceType || null,
    }));
    if (publishing && (!String(step.title || "").trim() || !String(step.description || "").trim())) {
      throw new Error(`Step ${index + 1} needs a title and description.`);
    }
    if (resources.some((resource) => (resource.url && resource.sourceType === "link" && !validateUrl(resource.url)) || (publishing && (!resource.label || (resource.sourceType === "link" && !resource.url) || (resource.sourceType === "file" && !resource.url))))) {
      throw new Error(`Step ${index + 1} contains an invalid resource link.`);
    }
    return {
      id: step.id ? Number(step.id) : undefined,
      title: String(step.title || "Untitled step").trim(), description: String(step.description || "").trim(),
      topics: Array.isArray(step.topics) ? JSON.stringify(step.topics) : String(step.topics || ""),
      estimatedTime: String(step.estimatedTime || "").trim() || null,
      practiceTask: String(step.practiceTask || "").trim() || null,
      stepOrder: index,
      resources,
    };
  });
  if (publishing && normalized.length < 1) throw new Error("Publishing requires at least one learning step.");
  return normalized;
};

const includeSteps = { model: RoadmapStep, as: "steps", include: { model: RoadmapResource, as: "resources" }, order: [["stepOrder", "ASC"], [{ model: RoadmapStep, as: "resources" }, "resourceOrder", "ASC"]] };

const shapeRoadmap = (roadmap, progress = []) => {
  const raw = roadmap.toJSON ? roadmap.toJSON() : roadmap;
  const steps = (raw.steps || []).sort((a, b) => a.stepOrder - b.stepOrder).map((step) => ({
    ...step,
    topics: parseJson(step.topics, step.topics ? String(step.topics).split(",").map((item) => item.trim()).filter(Boolean) : []),
    resources: (step.resources || []).sort((a, b) => a.resourceOrder - b.resourceOrder),
    completed: progress.includes(step.id),
  }));
  return { ...raw, steps, topicCount: steps.reduce((count, step) => count + step.topics.length, 0), progress: steps.length ? Math.round((progress.length / steps.length) * 100) : 0 };
};

const roadmapPayload = (body, files = {}) => ({
  title: String(body.title || "").trim(), targetRole: String(body.targetRole || "").trim() || null,
  roadmapContent: String(body.roadmapContent || body.shortDescription || "").trim() || null,
  shortDescription: String(body.shortDescription || "").trim() || null,
  category: String(body.category || "").trim() || null, difficulty: String(body.difficulty || "Beginner").trim(),
  durationWeeks: body.durationWeeks ? Number(body.durationWeeks) : null,
  steps: body.steps,
  coverUrl: files.cover?.[0]?.path || body.coverUrl || null,
  pdfUrl: files.pdf?.[0]?.path || body.pdfUrl || null,
  pdfName: files.pdf?.[0]?.originalname || body.pdfName || null,
});

const validateMetadata = (payload, publishing) => {
  if (publishing && (!payload.title || !payload.shortDescription || !payload.category || !DIFFICULTIES.includes(payload.difficulty) || !CATEGORIES.includes(payload.category) || !Number.isInteger(payload.durationWeeks) || payload.durationWeeks < 1)) {
    throw new Error("Title, description, category, difficulty, and a valid duration are required.");
  }
  return normalizeSteps(payload.steps, { publishing });
};

async function saveSteps(roadmap, steps, transaction) {
  const existing = await RoadmapStep.findAll({ where: { roadmapId: roadmap.id }, transaction });
  const retained = [];
  const filesToClean = [];
  for (const step of steps) {
    const record = step.id ? existing.find((item) => item.id === step.id) : null;
    const saved = record || await RoadmapStep.create({
      roadmapId: roadmap.id,
      title: step.title,
      description: step.description,
      topics: step.topics,
      estimatedTime: step.estimatedTime,
      practiceTask: step.practiceTask,
      stepOrder: step.stepOrder,
    }, { transaction });
    await saved.update({ title: step.title, description: step.description, topics: step.topics, estimatedTime: step.estimatedTime, practiceTask: step.practiceTask, stepOrder: step.stepOrder, updatedAt: new Date() }, { transaction });
    const existingResources = await RoadmapResource.findAll({ where: { stepId: saved.id }, transaction });
    const retainedResourceIds = [];
    for (const [index, resource] of step.resources.entries()) {
      const current = resource.id ? existingResources.find((item) => item.id === resource.id) : null;
      const values = { stepId: saved.id, label: resource.label, type: resource.type, sourceType: resource.sourceType, url: resource.url, storagePublicId: resource.storagePublicId, originalName: resource.originalName, mimeType: resource.mimeType, fileSize: resource.fileSize, resourceType: resource.resourceType, resourceOrder: index };
      if (current) {
        if (current.storagePublicId && current.storagePublicId !== resource.storagePublicId) filesToClean.push({ publicId: current.storagePublicId, resourceType: current.resourceType });
        await current.update(values, { transaction });
        retainedResourceIds.push(current.id);
      } else {
        const created = await RoadmapResource.create(values, { transaction });
        retainedResourceIds.push(created.id);
      }
    }
    existingResources.filter((resource) => !retainedResourceIds.includes(resource.id)).forEach((resource) => {
      if (resource.storagePublicId) filesToClean.push({ publicId: resource.storagePublicId, resourceType: resource.resourceType });
    });
    await RoadmapResource.destroy({ where: { stepId: saved.id, id: { [Op.notIn]: retainedResourceIds.length ? retainedResourceIds : [0] } }, transaction });
    retained.push(saved.id);
  }
  const obsolete = existing.filter((step) => !retained.includes(step.id)).map((step) => step.id);
  if (obsolete.length) {
    const obsoleteResources = await RoadmapResource.findAll({ where: { stepId: { [Op.in]: obsolete } }, transaction });
    obsoleteResources.forEach((resource) => { if (resource.storagePublicId) filesToClean.push({ publicId: resource.storagePublicId, resourceType: resource.resourceType }); });
    await RoadmapProgress.destroy({ where: { roadmapId: roadmap.id, stepId: { [Op.in]: obsolete } }, transaction });
    await RoadmapResource.destroy({ where: { stepId: { [Op.in]: obsolete } }, transaction });
    await RoadmapStep.destroy({ where: { id: { [Op.in]: obsolete } }, transaction });
  }
  return filesToClean;
}

async function cleanUnreferencedFiles(files) {
  for (const file of files) {
    const stillUsed = await RoadmapResource.count({ where: { storagePublicId: file.publicId } });
    if (!stillUsed) await cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType || "raw" });
  }
}

export const getRoadmaps = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 50);
    const where = { status: "published" }; const query = String(req.query.search || "").trim();
    if (query) where[Op.or] = [{ title: { [Op.like]: `%${query}%` } }, { shortDescription: { [Op.like]: `%${query}%` } }, { category: { [Op.like]: `%${query}%` } }];
    if (req.query.category && req.query.category !== "All") where.category = req.query.category;
    if (req.query.difficulty && req.query.difficulty !== "All") where.difficulty = req.query.difficulty;
    const order = req.query.sort === "title" ? [["title", "ASC"]] : [["publishedAt", "DESC"], ["createdAt", "DESC"]];
    const result = await Roadmap.findAndCountAll({ where, include: [includeSteps], distinct: true, order, limit, offset: (page - 1) * limit });
    return res.json({ success: true, data: result.rows.map((item) => shapeRoadmap(item)), pagination: { page, limit, total: result.count, pages: Math.ceil(result.count / limit) } });
  } catch (error) { return res.status(500).json({ message: "Failed to fetch roadmaps.", error: error.message }); }
};

export const getRoadmap = async (req, res) => {
  try {
    const isAdminPreview = req.path.startsWith("/admin/") && req.user.role === "admin";
    const roadmap = await Roadmap.findByPk(req.params.id, { include: [includeSteps] });
    if (!roadmap || (!isAdminPreview && roadmap.status !== "published")) return res.status(404).json({ message: "Roadmap not found." });
    const progress = isAdminPreview ? [] : (await RoadmapProgress.findAll({ where: { roadmapId: roadmap.id, userId: req.user.id, completedAt: { [Op.ne]: null } } })).map((item) => item.stepId);
    return res.json({ success: true, data: shapeRoadmap(roadmap, progress) });
  } catch (error) { return res.status(500).json({ message: "Failed to fetch roadmap.", error: error.message }); }
};

export const listAdminRoadmaps = async (req, res) => {
  const query = String(req.query.search || "").trim(); const where = {};
  if (query) where.title = { [Op.like]: `%${query}%` }; if (req.query.status && req.query.status !== "all") where.status = req.query.status;
  const rows = await Roadmap.findAll({ where, include: [includeSteps], order: [["updatedAt", "DESC"]] });
  return res.json({ success: true, data: rows.map((item) => shapeRoadmap(item)) });
};

const persistRoadmap = async (req, publishing, res) => {
  let transaction;
  try {
    const payload = roadmapPayload(req.body, { cover: req.files?.cover, pdf: req.files?.pdf });
    const steps = validateMetadata(payload, publishing);
    transaction = await sequelize.transaction();
    const roadmap = req.params.id ? await Roadmap.findByPk(req.params.id, { transaction }) : await Roadmap.create({ userId: req.user.id }, { transaction });
    if (!roadmap) { await transaction.rollback(); return res.status(404).json({ message: "Roadmap not found." }); }
    await roadmap.update({ ...payload, steps: undefined, status: publishing ? "published" : (roadmap.status || "draft"), publishedAt: publishing ? (roadmap.publishedAt || new Date()) : roadmap.publishedAt }, { transaction });
    const filesToClean = await saveSteps(roadmap, steps, transaction); await transaction.commit();
    await cleanUnreferencedFiles(filesToClean);
    return res.status(req.params.id ? 200 : 201).json({ success: true, data: roadmap, message: publishing ? "Roadmap published." : "Draft saved." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(400).json({ message: error.message || "Invalid roadmap data." });
  }
};

export const createRoadmap = (req, res) => persistRoadmap(req, false, res);
export const updateRoadmap = (req, res) => persistRoadmap(req, false, res);

export const uploadRoadmapResourceFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const resourceType = String(req.body.resourceType || "Article");
    const rule = RESOURCE_RULES[resourceType];
    const extension = `.${String(req.file.originalname).split(".").pop().toLowerCase()}`;
    if (!rule || !rule.extensions.includes(extension) || !rule.mimes.includes(req.file.mimetype)) {
      if (req.file.filename) await cloudinary.uploader.destroy(req.file.filename, { resource_type: req.file.resourceType || "raw" });
      return res.status(400).json({ message: `${resourceType} does not support this file format.` });
    }
    return res.status(201).json({ success: true, data: { sourceType: "file", url: req.file.path, storagePublicId: req.file.filename, originalName: req.file.originalname, mimeType: req.file.mimetype, fileSize: req.file.size, resourceType: req.file.resourceType } });
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getRoadmapResourceContent = async (req, res) => {
  try {
    const resource = await RoadmapResource.findByPk(req.params.resourceId, {
      include: [{ model: RoadmapStep, include: [Roadmap] }],
    });
    const roadmap = resource?.RoadmapStep?.Roadmap;
    const isAdmin = req.user.role === "admin";
    if (!resource || resource.sourceType !== "file" || (!isAdmin && roadmap?.status !== "published")) {
      return res.status(404).json({ message: "Resource file not found." });
    }
    if (!resource.url) return res.status(404).json({ message: "Resource file is unavailable." });

    const upstream = await axios.get(resource.url, { responseType: "arraybuffer", validateStatus: () => true, timeout: 30000 });
    const body = Buffer.from(upstream.data);
    const contentType = String(upstream.headers["content-type"] || "").toLowerCase();
    if (upstream.status < 200 || upstream.status >= 300 || !body.length || (resource.mimeType === "application/pdf" && (!body.subarray(0, 5).equals(Buffer.from("%PDF-")) || contentType.includes("text/html")))) {
      return res.status(502).json({ message: "The stored resource could not be retrieved as a valid PDF." });
    }
    const safeName = String(resource.originalName || `roadmap-resource-${resource.id}`).replace(/[\r\n"\\/]/g, "_");
    const filename = resource.mimeType === "application/pdf" && !safeName.toLowerCase().endsWith(".pdf") ? `${safeName}.pdf` : safeName;
    const encodedFilename = encodeURIComponent(filename);
    res.set({
      "Content-Type": resource.mimeType || contentType || "application/octet-stream",
      "Content-Length": String(body.length),
      "Content-Disposition": `${req.query.download === "1" ? "attachment" : "inline"}; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      "Cache-Control": "private, no-store",
    });
    return res.send(body);
  } catch (error) {
    console.error("[roadmap] resource content error", error.message);
    return res.status(502).json({ message: "Unable to retrieve this resource file." });
  }
};

export const getRoadmapPdf = async (req, res) => {
  try {
    const roadmap = await Roadmap.findByPk(req.params.id);
    if (!roadmap || roadmap.status !== "published" || !roadmap.pdfUrl) {
      return res.status(404).json({ message: "Roadmap PDF not found." });
    }
    const upstream = await axios.get(roadmap.pdfUrl, { responseType: "arraybuffer", validateStatus: () => true, timeout: 30000 });
    const body = Buffer.from(upstream.data);
    const contentType = String(upstream.headers["content-type"] || "").toLowerCase();
    if (upstream.status < 200 || upstream.status >= 300 || !body.length || !body.subarray(0, 5).equals(Buffer.from("%PDF-")) || contentType.includes("text/html")) {
      return res.status(502).json({ message: "The stored roadmap PDF is unavailable or invalid." });
    }
    const rawName = String(roadmap.pdfName || `${roadmap.title || "roadmap"}.pdf`).replace(/[\r\n"\\/]/g, "_");
    const filename = rawName.toLowerCase().endsWith(".pdf") ? rawName : `${rawName}.pdf`;
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": String(body.length),
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    });
    return res.send(body);
  } catch (error) {
    console.error("[roadmap] roadmap pdf error", error.message);
    return res.status(502).json({ message: "Unable to retrieve the roadmap PDF." });
  }
};
export const publishRoadmap = async (req, res) => {
  const roadmap = await Roadmap.findByPk(req.params.id, { include: [includeSteps] });
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });
  req.body = { ...roadmap.toJSON(), steps: JSON.stringify(roadmap.steps || []) };
  return persistRoadmap(req, true, res);
};
export const unpublishRoadmap = async (req, res) => { const roadmap = await Roadmap.findByPk(req.params.id); if (!roadmap) return res.status(404).json({ message: "Roadmap not found." }); await roadmap.update({ status: "draft", publishedAt: null }); return res.json({ success: true, data: roadmap }); };
export const deleteRoadmap = async (req, res) => { const roadmap = await Roadmap.findByPk(req.params.id); if (!roadmap) return res.status(404).json({ message: "Roadmap not found." }); await roadmap.destroy(); return res.json({ success: true }); };

export const updateProgress = async (req, res) => {
  const completed = req.body.completed === true || req.body.completed === "true";
  const roadmap = await Roadmap.findOne({ where: { id: req.params.roadmapId, status: "published" } });
  const step = await RoadmapStep.findOne({ where: { id: req.params.stepId, roadmapId: req.params.roadmapId } });
  if (!roadmap || !step) return res.status(404).json({ message: "Roadmap step not found." });
  if (completed) await RoadmapProgress.upsert({ userId: req.user.id, roadmapId: roadmap.id, stepId: step.id, completedAt: new Date(), updatedAt: new Date() });
  else await RoadmapProgress.destroy({ where: { userId: req.user.id, roadmapId: roadmap.id, stepId: step.id } });
  return res.json({ success: true, completed });
};
