/**
 * upload.middleware.js
 *
 * Custom multer StorageEngine that streams files directly to Cloudinary v2.
 * No temp files written to disk — file goes straight from memory → Cloudinary.
 *
 * Exports two ready-to-use multer instances:
 *   uploadResume  — accepts PDF only,       folder: careerlaunch/resumes
 *   uploadAvatar  — accepts JPEG/PNG/WEBP,  folder: careerlaunch/avatars
 */

import multer    from "multer";
import streamLib from "stream";
import cloudinary from "../config/cloudinary.js";

/* ─────────────────────────────────────────────────────────────────────────
   Custom Storage Engine
   multer calls  _handleFile  for every uploaded file.
   We pipe the incoming readable stream into cloudinary.uploader.upload_stream
   and attach the Cloudinary result to  req.cloudinaryResult  so the
   controller can read the secure_url.
───────────────────────────────────────────────────────────────────────── */
class CloudinaryStorage {
  /**
   * @param {object} opts
   * @param {string}   opts.folder        - Cloudinary folder path
   * @param {string}   opts.resourceType  - "image" | "raw" | "auto"
   * @param {string[]} [opts.allowedMimes]
   */
  constructor(opts) {
    this.folder       = opts.folder;
    this.resourceType = opts.resourceType || "auto";
    this.allowedMimes = opts.allowedMimes || null;
  }

  /* Called by multer for each file */
  _handleFile(req, file, cb) {
    // MIME check
    if (this.allowedMimes && !this.allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}`));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        this.folder,
        resource_type: this.resourceType,
        // use timestamp so public_id is always unique
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      },
      (error, result) => {
        if (error) return cb(error);
        // Attach to req so controller can access it
        req.cloudinaryResult = result;
        cb(null, {
          fieldname:   file.fieldname,
          originalname: file.originalname,
          mimetype:    file.mimetype,
          size:        result.bytes,
          cloudinary:  result,           // full result object
          path:        result.secure_url, // multer-compatible field
          filename:    result.public_id,
        });
      }
    );

    // Pipe multer's file stream into the Cloudinary upload stream
    const passThrough = new streamLib.PassThrough();
    file.stream.pipe(passThrough).pipe(uploadStream);
  }

  /* Called by multer when a file needs to be removed (e.g. on error) */
  _removeFile(req, file, cb) {
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, { resource_type: this.resourceType })
        .then(() => cb(null))
        .catch(cb);
    } else {
      cb(null);
    }
  }
}

/* ── Resume upload ────────────────────────────────────────────────────── */
export const uploadResume = multer({
  storage: new CloudinaryStorage({
    folder:       "careerlaunch/resumes",
    resourceType: "raw",                       // PDFs are "raw" in Cloudinary
    allowedMimes: ["application/pdf"],
  }),
  limits: { fileSize: 5 * 1024 * 1024 },      // 5 MB
});

/* ── Avatar upload ────────────────────────────────────────────────────── */
export const uploadAvatar = multer({
  storage: new CloudinaryStorage({
    folder:       "careerlaunch/avatars",
    resourceType: "image",
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
  }),
  limits: { fileSize: 2 * 1024 * 1024 },      // 2 MB
});
