import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

redis.on("connect", () => {});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
