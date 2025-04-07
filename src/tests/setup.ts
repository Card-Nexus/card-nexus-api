import { buildFastify } from "./../utils/buildFastify";
import { sequelize } from "./../config/database";
import { redis } from "./../config/redis"; // Import the Redis instance
import { FastifyInstance } from "fastify";
import {matchers} from 'jest-json-schema'

let app: FastifyInstance;
expect.extend(matchers)

beforeAll(async () => {
  try {
    // Reset the database schema
    // await sequelize.sync({ force: true });

    // Build the Fastify app
    app = buildFastify();
    await app.ready();
  } catch (error) {
    console.error("Setup failed:", error);
  }
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  // Close the Redis connection
  await redis.quit();

  // Do NOT close the database connection here if other test files depend on it
});

// Export the app for use in tests
export { app };