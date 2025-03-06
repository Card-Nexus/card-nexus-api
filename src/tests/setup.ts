import { sequelize } from "./../config/database";

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to test database:", sequelize.getDatabaseName());
    await sequelize.sync({force: true})
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});

afterAll(async () => {
  await sequelize.close();
});
