/**
 * Global Constants
 * Avoid hardcoding values across the app
 */

// API BASE URL — always read from the Vite env variable, never hardcode localhost.
// Set VITE_API_URL in .env.development / .env.production / Vercel dashboard.
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Local Storage Keys
export const TOKEN_KEY = "token";
export const USER_KEY = "user";

// Job Types
export const JOB_TYPES = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  INTERN: "Internship",
  CONTRACT: "Contract",
};

// Experience Levels
export const EXPERIENCE_LEVELS = {
  FRESHER: "Fresher",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
};

// AI Roles (for ChatGPT system prompts or UI filters)
export const AI_ROLES = {
  CAREER_GUIDE: "career-guide",
  INTERVIEW_PREP: "interview-prep",
  RESUME_HELPER: "resume-helper",
};