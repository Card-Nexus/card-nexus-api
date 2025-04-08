import { Sequelize } from "sequelize";
import { env } from "./env";

const isTest = process.env.NODE_ENV === "test";

export const sequelize = new Sequelize(
  isTest ? "test_db" : env.POSTGRES_DB,
  isTest ? "test_user" : env.POSTGRES_USER,
  isTest ? "test_password" : env.POSTGRES_PASSWORD,
  {
    host: "localhost",
    port: isTest ? 5433 : 5432,
    dialect: "postgres",
    logging: !isTest,
  }
);

(async () => {
  try {
  
    await sequelize.authenticate();
    await sequelize.sync()
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error);
  }
})();
