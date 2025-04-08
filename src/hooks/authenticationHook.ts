// src/hooks/authenticationHook.ts
import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import APIKey from '../models/APIKeysModel'; 
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const apiKey = request.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    reply.status(401).send({ error: 'Unauthorized: API key missing' });
    return done(new Error('Unauthorized'));
  }

  try {
    const validKey = await APIKey.findOne({
      where: {
        key: apiKey,
        isActive: true,
        usageType: 'scraper', 
      },
    });

    if (validKey) {
      done(); 
    } else {
      reply.status(401).send({ error: 'Unauthorized: Invalid API key' });
      done(new Error('Unauthorized'));
    }
  } catch (error : any) {
    console.error('Error during API key authentication:', error);
    reply.status(500).send({ error: 'Internal server error during authentication' });
    done(error);
  }
};