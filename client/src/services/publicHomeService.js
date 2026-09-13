import api from "./api";

export const getPublicHomeCompanies = (refresh = false) =>
  api.get("/public/home/companies", { params: refresh ? { refresh: true } : undefined, timeout: 8000 });