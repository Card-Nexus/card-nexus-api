import Fastify from "fastify";
import { setupSwagger } from "./../swagger";
import { sequelize } from "../config/database";
import { redis } from "../config/redis";
import { env } from "../config/env";
import tcgRoutes from "../routes/tcgRoutes";
import pokemonRoutes from "../routes/pokemonRoutes";
import "../models/initModels"; // Import your models

export const buildFastify = async () => {
    const server = Fastify({
        logger: {
            level: 'info',
            serializers: {
                req(request) {
                    return {
                        method: request.method,
                        url: request.url,
                        hostname: request.hostname,
                        remoteAddress: request.ip
                    };
                }
            }
        }
    });

    // Setup Swagger
    setupSwagger(server);

    // Register routes
    server.register(tcgRoutes, { prefix: "/v1/tcg" });
    server.register(pokemonRoutes, { prefix: "/v1/pokemon" });

    // Single cleanup hook
    server.addHook("onClose", async () => {
        try {
            await Promise.all([
                sequelize.close(),
                redis.quit()
            ]);
        } catch (error) {
            server.log.error("Cleanup error:", error);
        }
    });

    // Database and Redis setup, *before* starting the server
    try {
        await sequelize.authenticate();
        console.log("Database authenticated");
        // { alter: true }
        await sequelize.sync();
        console.log("Database synced");
        await redis.ping();
        console.log("Redis is available");

    } catch (error) {
        server.log.error("Error setting up database or Redis:", error);
        process.exit(1); // Exit if database/Redis setup fails
        return; // Important:  Exit the function!
    }



    // Start the server here, bind to 0.0.0.0
    try {
        await server.listen({
            port: Number(env.PORT),
            host: "0.0.0.0", // Explicitly bind to all interfaces
            listenTextResolver: (address) => {
                return `Server running at ${address}`;
            }
        });
        return server; // Return the server instance
    } catch (error) {
        server.log.error("Error starting server:", error);
        process.exit(1); // Exit if server fails to start
        return; // Important: Exit the function.
    }
};
