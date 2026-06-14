import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./config/db.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("✅ Database connected and models synced");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();