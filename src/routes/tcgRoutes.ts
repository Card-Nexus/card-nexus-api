import { FastifyInstance } from "fastify";
import * as TCGController from "../controllers/tcgController";

export default async function tcgRoutes (server: FastifyInstance)  {
  server.get("/", TCGController.getAllTCGs); 
  server.get("/:identifier", TCGController.getTCGByIdentifier);
};
