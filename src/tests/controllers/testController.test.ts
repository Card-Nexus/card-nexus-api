import supertest from "supertest";
import { app } from "../setup"; // Import your Fastify app
import { sequelize } from "../../config/database";
import { TCG } from "../../models/tcgModels";
import { v4 as uuidv4 } from "uuid";

describe("TCG Controller Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); 

    // Seed the database with test TCGs
    await TCG.bulkCreate([
      {
        id: uuidv4(),
        name: "Pokémon TCG",
        slug: "pokemon-tcg",
        img: "https://example.com/pokemon.jpg",
      },
      {
        id: uuidv4(),
        name: "Magic: The Gathering",
        slug: "magic-the-gathering",
        img: "https://example.com/mtg.jpg",
      },
    ]);
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  describe("GET /v1/tcg", () => {
    it("should fetch all TCGs", async () => {
      const response = await supertest(app.server)
        .get("/v1/tcg")
        .expect(200);
  
      expect(response.body.length).toBe(2); // Expect 2 TCGs
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Pokémon TCG",
            slug: "pokemon-tcg",
          }),
          expect.objectContaining({
            name: "Magic: The Gathering",
            slug: "magic-the-gathering",
          }),
        ])
      );
    });

    it("should handle errors when fetching TCGs", async () => {
        // Mock the findAll method to throw an error
        jest.spyOn(TCG, "findAll").mockRejectedValueOnce(new Error("Database error"));
      
        const response = await supertest(app.server)
          .get("/v1/tcg")
          .expect(500);
      
        expect(response.body).toEqual({ error: "Failed to fetch TCGs" });
      });

  });

  describe("GET /v1/tcg/:identifier", () => {
    it("should fetch a TCG by its ID", async () => {
      const tcg = await TCG.findOne({ where: { slug: "pokemon-tcg" } });
      const response = await supertest(app.server)
        .get(`/v1/tcg/${tcg?.id}`) // Use the TCG's ID
        .expect(200);
  
      expect(response.body).toEqual(
        expect.objectContaining({
          name: "Pokémon TCG",
          slug: "pokemon-tcg",
        })
      );
    });

    it("should fetch a TCG by its slug", async () => {
        const response = await supertest(app.server)
          .get("/v1/tcg/pokemon-tcg") // Use the TCG's slug
          .expect(200);
      
        expect(response.body).toEqual(
          expect.objectContaining({
            name: "Pokémon TCG",
            slug: "pokemon-tcg",
          })
        );
      });

      it("should return 404 if TCG is not found", async () => {
        const response = await supertest(app.server)
          .get("/v1/tcg/non-existent-tcg") // Use a non-existent slug
          .expect(404);
      
        expect(response.body).toEqual({ error: "TCG not found" });
      });

      it("should handle errors when fetching a TCG", async () => {
        // Mock the findOne method to throw an error
        jest.spyOn(TCG, "findOne").mockRejectedValueOnce(new Error("Database error"));
      
        const response = await supertest(app.server)
          .get("/v1/tcg/pokemon-tcg")
          .expect(500);
      
        expect(response.body).toEqual({ error: "Failed to fetch TCG" });
      });

  });
});