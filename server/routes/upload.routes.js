/**
 * upload.routes.js
 *
 * POST /api/upload/resume   — multipart/form-data, field: "resume"
 * POST /api/upload/avatar   — multipart/form-data, field: "avatar"
 *
 * Both routes are protected — JWT required.
 * multer runs first (streams to Cloudinary), then the controller
 * saves the returned secure_url into the users table.
 */

import express from "express";
import { verifyToken }              from "../middleware/auth.middleware.js";
import { uploadResume, uploadAvatar } from "../middleware/upload.middleware.js";
import {
  uploadResume as handleResume,
  uploadAvatar as handleAvatar,
} from "../controllers/upload.controller.js";

const router = express.Router();

/**
 * Resume upload
 * Accepts a single PDF file in the "resume" field.
 * Stores it in Cloudinary folder: careerlaunch/resumes
 * Saves the secure_url to users.resume_url
 */
router.post(
  "/resume",
  verifyToken,
  uploadResume.single("resume"),
  handleResume
);

/**
 * Avatar upload
 * Accepts a single image (JPEG/PNG/WEBP) in the "avatar" field.
 * Stores it in Cloudinary folder: careerlaunch/avatars
 * Saves the secure_url to users.profile_image
 */
router.post(
  "/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  handleAvatar
);

export default router;
