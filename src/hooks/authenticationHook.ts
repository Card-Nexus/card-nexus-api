// src/hooks/authenticationHook.ts
import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";
import APIKey from "../models/APIKeysModel";
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const apiKey = request.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    return reply.status(401).send({ error: "Unauthorized: API key missing" });
  }

  try {
    const validKey = await APIKey.findOne({
      where: {
        key: apiKey,
        isActive: true,
        usageType: "scraper",
      },
    });

    if (!validKey) {
      return reply.status(401).send({ error: "Unauthorized: Invalid API key" });
    }
    // No explicit return needed - just fall through
  } catch (error) {
    request.log.error("Authentication error:", error);
    return reply
      .status(500)
      .send({ error: "Internal server error during authentication" });
  }
};
