import { sequelize } from "./../../config/database";
import { seedPokemonData } from "./seedPokemon";

export const seedDatabase = async () => {
    try {
        await sequelize.sync({force: true})
        await seedPokemonData();
    } catch (error) {
        console.error("Failed to seed the database:", error);
    }
}

seedDatabase()