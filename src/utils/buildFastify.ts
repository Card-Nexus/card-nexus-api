import Fastify from "fastify";
import { setupSwagger } from "./../swagger";
import { sequelize } from "./../config/database";
import { redis } from "./../config/redis";
import { env } from "./../config/env";
import tcgRoutes from "./../routes/tcgRoutes";
import pokemonRoutes from "./../routes/pokemonRoutes";
import "./../models/pokemonModels";

export const buildFastify = () => {
  const server = Fastify({ logger: true });

  setupSwagger(server);

  server.get("/", async (request, reply) => {
    return { message: "Hello, TypeScript with Fastify!" };
  });

  server.register(tcgRoutes, { prefix: "/v1/tcg" });
  server.register(pokemonRoutes, { prefix: "/v1/pokemon" });

  server.get("/health", async (request, reply) => {
    return { status: "ok" };
  });

  server.addHook("onClose", async () => {
    await sequelize.close();
    await redis.quit();
  });

  return server;
};