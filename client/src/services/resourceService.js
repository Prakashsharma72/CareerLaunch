import api from "./api";

/**
 * Learning resources APIs
 */
export const getResources = () => {
  return api.get("/resources");
};

export const addResource = (data) => {
  return api.post("/resources", data);
};

export const deleteResource = (id) => {
  return api.delete(`/resources/${id}`);
};