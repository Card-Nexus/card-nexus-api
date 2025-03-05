import { FastifyInstance } from "fastify";
import {
  getAllEras,
  getEraByIdentifier,
  getAllSets,
  getSetByIdentifier,
  getAllCards,
  getCardByIdentifier,
} from "./../controllers/pokemonController";

export default async function pokemonRoutes(fastify: FastifyInstance) {
  fastify.get("/eras", getAllEras);
  fastify.get("/eras/:identifier", getEraByIdentifier);

  fastify.get("/sets", getAllSets);
  fastify.get("/sets/:identifier", getSetByIdentifier);

  fastify.get("/cards", getAllCards);
  fastify.get("/card/:identifier", getCardByIdentifier);
}
