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
  * @param {string}   [opts.format]       - Cloudinary output format
   */
  constructor(opts) {
    this.folder       = opts.folder;
    this.resourceType = opts.resourceType || "auto";
    this.allowedMimes = opts.allowedMimes || null;
    this.format       = opts.format || null;
  }

  /* Called by multer for each file */
  _handleFile(req, file, cb) {
    // MIME check
    if (this.allowedMimes && !this.allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}`));
    }

    const resourceType = this.resourceType === "auto"
      ? file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
          ? "video"
          : "raw"
      : this.resourceType;
        const isRoadmapPdf = file.fieldname === "pdf" && file.mimetype === "application/pdf";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        this.folder,
        resource_type: isRoadmapPdf ? "raw" : resourceType,
        ...(isRoadmapPdf && { format: "pdf" }),
        ...(this.format && { format: this.format }),
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
          resourceType,
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
      cloudinary.uploader.destroy(file.filename, { resource_type: file.resourceType || this.resourceType })
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
    format: "pdf",
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

export const uploadResource = multer({
  storage: new CloudinaryStorage({
    folder: "careerlaunch/resources",
    resourceType: "auto",
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const uploadRoadmapCover = multer({
  storage: new CloudinaryStorage({
    folder: "careerlaunch/roadmaps/covers",
    resourceType: "image",
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadRoadmapPdf = multer({
  storage: new CloudinaryStorage({
    folder: "careerlaunch/roadmaps/pdfs",
    resourceType: "raw",
    allowedMimes: ["application/pdf"],
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadRoadmapFiles = multer({
  storage: new CloudinaryStorage({
    folder: "careerlaunch/roadmaps",
    resourceType: "auto",
    allowedMimes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  }),
  fileFilter: (_req, file, cb) => {
    const isCover = file.fieldname === "cover" && ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    const isPdf = file.fieldname === "pdf" && file.mimetype === "application/pdf";
    cb(isCover || isPdf ? null : new Error("Roadmap cover must be an image and roadmap PDF must be a PDF."), isCover || isPdf);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadRoadmapResource = multer({
  storage: new CloudinaryStorage({
    folder: "careerlaunch/roadmaps/resources",
    resourceType: "auto",
    allowedMimes: [
      "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", "video/mp4", "video/webm", "application/zip", "application/x-zip-compressed",
    ],
  }),
  limits: { fileSize: Number(process.env.ROADMAP_RESOURCE_MAX_BYTES || 50 * 1024 * 1024) },
});
