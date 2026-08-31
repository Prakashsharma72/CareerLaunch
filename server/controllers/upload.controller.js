/**
 * upload.controller.js
 *
 * Handles resume and avatar uploads.
 * By the time these handlers run, multer + CloudinaryStorage have already
 * streamed the file to Cloudinary and attached the result to req.file.
 *
 * Routes:
 *   POST /api/upload/resume   — field: "resume"
 *   POST /api/upload/avatar   — field: "avatar"
 */

import { updateUserProfile } from "../services/user.service.js";

/**
 * POST /api/upload/resume
 * Saves the Cloudinary secure_url to users.resume_url
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumeUrl = req.file.path; // set by our custom storage engine

    const updated = await updateUserProfile(req.user.id, { resumeUrl });

    return res.status(200).json({
      message:   "Resume uploaded successfully",
      resumeUrl,
      user:      updated,
    });
  } catch (err) {
    console.error("[upload] resume error:", err.message);
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * POST /api/upload/avatar
 * Saves the Cloudinary secure_url to users.profile_image
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profileImage = req.file.path; // set by our custom storage engine

    const updated = await updateUserProfile(req.user.id, { profileImage });

    return res.status(200).json({
      message:      "Avatar uploaded successfully",
      profileImage,
      user:         updated,
    });
  } catch (err) {
    console.error("[upload] avatar error:", err.message);
    return res.status(err.status || 500).json({ message: err.message });
  }
};
