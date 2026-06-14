import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

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
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/ai", aiRoutes);

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