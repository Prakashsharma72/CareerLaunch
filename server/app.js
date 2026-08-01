import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes           from "./routes/auth.routes.js";
import userRoutes           from "./routes/user.routes.js";
import jobRoutes            from "./routes/job.routes.js";
import resourceRoutes       from "./routes/resource.routes.js";
import aiRoutes             from "./routes/ai.routes.js";
import interviewRoutes      from "./routes/interview.routes.js";
import companyRoutes        from "./routes/company.routes.js";
import savedCompanyRoutes   from "./routes/savedCompany.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import sequelize from "./config/db.js";

// Import models so Sequelize registers them before sync
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

dotenv.config();

const app = express();

/**
 * MIDDLEWARES
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API ROUTES
 */
app.use("/api/auth",            authRoutes);
app.use("/api/users",           userRoutes);
app.use("/api/jobs",            jobRoutes);
app.use("/api/resources",       resourceRoutes);
app.use("/api/ai",              aiRoutes);
app.use("/api/interview",       interviewRoutes);
app.use("/api/companies",       companyRoutes);
app.use("/api/saved-companies", savedCompanyRoutes);

/**
 * HEALTH CHECK ROUTE
 */
app.get("/", (req, res) => {
  res.send("🚀 AI Career Platform API is running");
});

/**
 * ERROR HANDLER (must be last)
 */
app.use(errorHandler);

export default app;