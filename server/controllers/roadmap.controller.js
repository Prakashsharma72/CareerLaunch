import Roadmap from "../models/roadmap.model.js";

export const getRoadmaps = async (_req, res) => {
  try {
    const roadmaps = await Roadmap.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: roadmaps });
  } catch (error) {
    console.error("[roadmap] getRoadmaps error", error);
    return res.status(500).json({ message: "Failed to fetch roadmaps.", error: error.message });
  }
};

export const createRoadmap = async (req, res) => {
  try {
    const { title, targetRole, roadmapContent } = req.body;

    if (!title || !roadmapContent) {
      return res.status(400).json({ message: "Title and roadmap content are required." });
    }

    const roadmap = await Roadmap.create({
      title,
      targetRole: targetRole || null,
      roadmapContent,
    });

    return res.status(201).json({ message: "Roadmap uploaded successfully.", data: roadmap });
  } catch (error) {
    console.error("[roadmap] createRoadmap error", error);
    return res.status(500).json({ message: "Failed to upload roadmap.", error: error.message });
  }
};
