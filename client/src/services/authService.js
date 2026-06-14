import api from "./api";

/**
 * Authentication API calls
 */
export const loginUser = (data) => {
  return api.post("/auth/login", data);
};

export const registerUser = (data) => {
  return api.post("/auth/register", data);
};

export const getProfile = () => {
  return api.get("/auth/profile");
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};