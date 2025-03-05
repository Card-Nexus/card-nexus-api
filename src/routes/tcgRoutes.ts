import { FastifyInstance } from "fastify";
import * as TCGController from "../controllers/tcgController";

export default async function tcgRoutes (server: FastifyInstance)  {
  server.get("/tcg", TCGController.getAllTCGs); 
  server.get("/tcg/:identifier", TCGController.getTCGByIdentifier);
};
