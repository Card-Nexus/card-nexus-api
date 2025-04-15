import { FastifyInstance } from "fastify";
import * as TCGController from "../controllers/tcgController";
import { authenticate } from "../hooks/authenticationHook";
export default async function tcgRoutes (server: FastifyInstance)  {
  server.get("/", TCGController.getAllTCGs); 
  server.get("/:identifier", TCGController.getTCGByIdentifier);
  server.post("/", { onRequest: [authenticate] }, TCGController.postTCG);
};
