// ── Load .env FIRST — must happen before any other import reads process.env ─
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors    from "cors";

import authRoutes         from "./routes/auth.routes.js";
import userRoutes         from "./routes/user.routes.js";
import jobRoutes          from "./routes/job.routes.js";
import resourceRoutes     from "./routes/resource.routes.js";
import aiRoutes           from "./routes/ai.routes.js";
import interviewRoutes    from "./routes/interview.routes.js";
import companyRoutes      from "./routes/company.routes.js";
import savedCompanyRoutes from "./routes/savedCompany.routes.js";
import placesRoutes       from "./routes/places.routes.js";
import settingsRoutes     from "./routes/settings.routes.js";
import uploadRoutes       from "./routes/upload.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import sequelize         from "./config/db.js";  // eslint-disable-line no-unused-vars

// Register all Sequelize models before sync
import "./models/user.model.js";
import "./models/job.model.js";
import "./models/company.model.js";
import "./models/savedCompany.model.js";
import "./models/interviewSession.model.js";
import "./models/interviewQuestion.model.js";
import "./models/application.model.js";
import "./models/roadmap.model.js";
import "./models/resumeAnalysis.model.js";
import "./models/savedJob.model.js";

const app = express();

/* ── CORS ─────────────────────────────────────────────────────────────────── */
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Routes ───────────────────────────────────────────────────────────────── */
app.use("/api/auth",            authRoutes);
app.use("/api/users",           userRoutes);
app.use("/api/jobs",            jobRoutes);
app.use("/api/resources",       resourceRoutes);
app.use("/api/ai",              aiRoutes);
app.use("/api/interview",       interviewRoutes);
app.use("/api/companies",       companyRoutes);
app.use("/api/saved-companies", savedCompanyRoutes);
app.use("/api/places",          placesRoutes);
app.use("/api/settings",        settingsRoutes);
app.use("/api/upload",          uploadRoutes);

/* ── Health check ─────────────────────────────────────────────────────────── */
app.get("/", (_req, res) => res.send("🚀 CareerLaunch AI API is running"));

/* ── Global error handler (must be last) ──────────────────────────────────── */
app.use(errorHandler);

export default app;
