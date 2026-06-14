/**
 * Helper utility functions
 */

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    value.toString().trim() === ""
  );
};

/**
 * Debounce function (useful for search bars)
 */
export const debounce = (func, delay = 500) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate random ID (for frontend temp items)
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Format salary (e.g., 50000 → 50,000)
 */
export const formatSalary = (amount) => {
  if (!amount) return "0";
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};