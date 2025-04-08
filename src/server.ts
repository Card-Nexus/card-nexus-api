import { buildFastify } from "./utils/buildFastify";
import { sequelize } from "./config/database";
import { redis } from "./config/redis";
import { env } from "./config/env";
import TCG from "./models/tcgModels";
import { pkmnSet, pkmnEra, pkmnCard } from "./models/pokemonModels";
import { APIKey } from "./models/APIKeysModel";

const start = async () => {
  const server = buildFastify();

  try {
    await sequelize.authenticate();
    console.log("Database authenticated");

    console.log('APIKey Model:', APIKey)

    await sequelize.sync();

    await redis.ping();
    console.log("Redis is available");

    await server.listen({ port: Number(env.PORT), host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
