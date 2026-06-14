import dotenv from "dotenv";

/**
 * Load .env variables
 */
const loadEnv = () => {
  const result = dotenv.config();

  if (result.error) {
    throw new Error("❌ .env file not found or invalid");
  }

  console.log("✅ Environment variables loaded successfully");
};

export default loadEnv;