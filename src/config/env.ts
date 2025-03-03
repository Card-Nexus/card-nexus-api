import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "3000",
  POSTGRES_USER: process.env.POSTGRES_USER || "dev_user",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "dev_password",
  POSTGRES_DB: process.env.POSTGRES_DB || "dev_db",
  POSTGRES_HOST: process.env.POSTGRES_HOST || "localhost",
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT) || 5432,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
};
