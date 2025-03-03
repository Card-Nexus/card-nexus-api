import Fastify from "fastify";
import { setupSwagger } from './swagger';
import { sequelize } from "./config/database";
import { redis } from "./config/redis";
import { env } from "./config/env";
import { tcgRoutes } from "./routes/shared/tcgRoutes";

const server = Fastify({ logger: true });

setupSwagger(server);

server.get("/", async (request, reply) => {
  return { message: "Hello, TypeScript with Fastify!" };
});

server.register(tcgRoutes, { prefix: '/v1' });

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database authenticated");

    await redis.ping();
    console.log("Redis is available");

    await server.listen({ port: Number(env.PORT) });
    console.log(`Server running at http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
