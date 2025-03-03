import { FastifyInstance } from "fastify";
import * as TCGController from "./../../controllers/shared/tcgController";

export const tcgRoutes = async (server: FastifyInstance) => {
  server.get("/tcg", TCGController.getAllTCGs); // Route for fetching all TCGs
  server.get("/tcg/:identifier", TCGController.getTCGByIdentifier); // Route for fetching TCG by id or slug
};
