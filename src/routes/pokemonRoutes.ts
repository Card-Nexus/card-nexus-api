import { FastifyInstance } from "fastify";
import {
  getAllEras,
  getEraByIdentifier,
  getAllSets,
  getSetByIdentifier,
  getAllCards,
  getCardByIdentifier,
  postEra,
  postSet,
  postCard,
  postCardsBulk,
} from "./../controllers/pokemonController";
import { authenticate } from "../hooks/authenticationHook";
import { sequelize } from "../config/database";
import { doesNotMatch } from "assert";

export default function pokemonRoutes(fastify: FastifyInstance) {
  fastify.get("/eras", getAllEras);
  fastify.get("/eras/:identifier", getEraByIdentifier);
  fastify.post("/eras", { onRequest: [authenticate] }, postEra);
  fastify.get("/sets", getAllSets);
  fastify.get("/sets/:identifier", getSetByIdentifier);
  fastify.post("/sets", { onRequest: [authenticate] }, postSet);
  fastify.get("/cards", getAllCards);
  fastify.get("/cards/:identifier", getCardByIdentifier);
  fastify.post("/cards", { onRequest: [authenticate] }, postCard);
  fastify.post("/cards/bulk", { onRequest: [authenticate] }, postCardsBulk);
  fastify.post('/testpost', { onRequest: [authenticate] }, async (request, reply) => {
    const reqId = request.id;
    fastify.log.info({ reqId, message: "/testpost route hit", body: request.body });
    reply.status(200).send({ message: 'Test POST' });
});
};


