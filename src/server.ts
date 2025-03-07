import { buildFastify } from "./utils/buildFastify";
import { sequelize } from "./config/database";
import { redis } from "./config/redis";
import { env } from "./config/env";

const start = async () => {
  const server = buildFastify();

  try {
    await sequelize.authenticate();
    console.log("Database authenticated");
    await sequelize.sync();

    await redis.ping();
    console.log("Redis is available");

    await server.listen({ port: Number(env.PORT), host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
