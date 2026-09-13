import express from "express";
import { getPublicCompanies } from "../controllers/public.controller.js";

const router = express.Router();

router.get("/home/companies", getPublicCompanies);

export default router;
