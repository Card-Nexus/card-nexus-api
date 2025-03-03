import FastifySwagger from 'fastify-swagger';
import { FastifyInstance } from 'fastify';

export const setupSwagger = (server: FastifyInstance) => {
  server.register(FastifySwagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Card Nexus API',
        description: 'API documentation for Card Nexus',
        version: '1.0.0',
      },
      externalDocs: {
        url: 'https://swagger.io/specification/',
        description: 'Find more info here',
      },
    },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true,
    },
  });
};
