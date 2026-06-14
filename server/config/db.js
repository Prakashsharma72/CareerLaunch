import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const DIALECT = process.env.DB_DIALECT || "sqlite";

const createMysqlSequelize = () => {
  const DATABASE = process.env.DB_NAME || "careerlaunch";
  const USER = process.env.DB_USER || process.env.MYSQL_USER || "root";
  const rawPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "";
  const PASSWORD = rawPassword === "your_password" ? "" : rawPassword;
  const HOST = process.env.DB_HOST || "127.0.0.1";

  return new Sequelize(DATABASE, USER, PASSWORD, {
    host: HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
};

const createSqliteSequelize = () => {
  const STORAGE = process.env.DB_STORAGE || "careerlaunch.sqlite";

  return new Sequelize({
    dialect: "sqlite",
    storage: STORAGE,
    logging: false,
  });
};

const sequelize = DIALECT === "mysql" ? createMysqlSequelize() : createSqliteSequelize();

export default sequelize;