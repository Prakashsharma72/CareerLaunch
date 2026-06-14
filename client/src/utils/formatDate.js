/**
 * Date Formatting Utilities
 */

/**
 * Format date to readable string
 * Example: 2026-06-14 → 14 Jun 2026
 */
export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const timeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);

  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;

  return formatDate(date);
};

/**
 * Format ISO date to YYYY-MM-DD (for inputs)
 */
export const toInputDate = (date) => {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0];
};