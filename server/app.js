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
import adminRoutes        from "./routes/admin.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import sequelize         from "./config/db.js";  // eslint-disable-line no-unused-vars

// Register all Sequelize models before sync
import "./models/user.model.js";
import "./models/job.model.js";
import "./models/resource.model.js";
import "./models/company.model.js";
import "./models/savedCompany.model.js";
import "./models/interviewSession.model.js";
import "./models/interviewQuestion.model.js";
import "./models/roadmap.model.js";
import "./models/savedJob.model.js";

// Import associations after all models are loaded
import "./models/associations.js";

const app = express();

/* ── CORS ─────────────────────────────────────────────────────────────────── */
// Explicit allowlist — never use the open cors() wildcard in production.
// On mobile browsers, a missing or wrong CORS header silently blocks the
// request before it ever reaches the controller.
const ALLOWED_ORIGINS = [
  // Local development
  "http://localhost:5173",
  "http://localhost:4173",   // vite preview
  "http://127.0.0.1:5173",
  // Production frontend (Vercel)
  // Add every domain Vercel assigns (custom + generated)

  "https://careerlaunch-ai.vercel.app",
  // Allow any *.vercel.app preview deployment for this project
  process.env.FRONTEND_URL,  // set this on Render for easy overrides
].filter(Boolean);           // drop undefined if FRONTEND_URL not set

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server calls and same-origin requests (origin is undefined)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview URL for this project
      if (/^https:\/\/careerlaunch[\w-]*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.warn(`[cors] Blocked origin: ${origin}`);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
    credentials: false,   // we use Bearer tokens, not cookies — keep false
    optionsSuccessStatus: 200,   // some legacy mobile browsers choke on 204
  })
);

// Handle preflight OPTIONS requests explicitly before any other middleware
app.options("*", cors());

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
app.use("/api/admin",           adminRoutes);

/* ── Health check ─────────────────────────────────────────────────────────── */
app.get("/", (_req, res) => res.send("🚀 CareerLaunch AI API is running"));

/* ── Global error handler (must be last) ──────────────────────────────────── */
app.use(errorHandler);

export default app;
