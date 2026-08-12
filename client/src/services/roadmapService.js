import api from "./api";

export const getRoadmaps = async () => {
  const response = await api.get("/roadmaps");
  return response.data;
};

export const createRoadmap = async ({ title, targetRole, roadmapContent }) => {
  const response = await api.post("/roadmaps", {
    title,
    targetRole,
    roadmapContent,
  });
  return response.data;
};

const roadmapService = {
  getRoadmaps,
  createRoadmap,
};

export default roadmapService;
