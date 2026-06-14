import Resource from "../models/resource.model.js";

/**
 * ADD RESOURCE
 */
export const addResourceService = async (data) => {
  return await Resource.create(data);
};

/**
 * GET RESOURCES
 */
export const getResourcesService = async () => {
  return await Resource.findAll({ order: [["createdAt", "DESC"]] });
};

/**
 * DELETE RESOURCE
 */
export const deleteResourceService = async (id) => {
  const resource = await Resource.findByPk(id);

  if (!resource) {
    throw new Error("Resource not found");
  }

  await resource.destroy();

  return { message: "Deleted successfully" };
};