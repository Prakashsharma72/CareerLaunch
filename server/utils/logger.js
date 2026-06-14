
/**
 * Simple Logger Utility
 */

export const logger = {
  info: (message) => {
    console.log(`ℹ️ INFO: ${message}`);
  },

  success: (message) => {
    console.log(`✅ SUCCESS: ${message}`);
  },

  warn: (message) => {
    console.log(`⚠️ WARN: ${message}`);
  },

  error: (message) => {
    console.log(`❌ ERROR: ${message}`);
  },
};