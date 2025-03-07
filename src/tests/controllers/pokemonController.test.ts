import supertest from "supertest";
import { app } from "../setup"; // Import the app from setup.ts
import { sequelize } from "../../config/database";
import { seedDatabase } from "../../utils/seeders/seed";
import {
  pkmnSet,
  pkmnEra,
  pkmnCard,
  pkmnCardAttributes,
} from "./../../models/pokemonModels";
import { TCG } from "../../models/tcgModels";
import { v4 as uuidv4 } from "uuid";

describe("Pokemon Controller Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const tcg = await TCG.create({
      id: uuidv4(),
      name: "Pokémon TCG",
      slug: "pokemon-tcg",
      img: "https://example.com/tcg.jpg",
    });

    const era = await pkmnEra.create({
      id: uuidv4(),
      name: "Original Series",
      slug: "original-series",
    });

    const set = await pkmnSet.create({
      id: uuidv4(),
      name: "Base Set",
      slug: "base-set",
      eraId: era.id,
      releaseDate: "1999-01-09",
      setCode: "BS-1",
      tcgId: tcg.id,
    });

    await pkmnCard.bulkCreate([
      {
        id: uuidv4(),
        name: "Charizard",
        slug: "charizard",
        setId: set.id,
        details: {
          hp: "120",
          type: "Fire",
          cardType: "Pokémon",
          setNumber: "4/102",
          moves: [
            {
              cost: ["Fire", "Fire", "Fire"],
              name: "Fire Spin",
              damage: 100,
            },
          ],
          weakness: "Water",
          resistance: "Fighting",
          retreat: 3,
          illustrated: "Mitsuhiro Arita",
          rarity: "Rare Holo",
          flavorText: "Spits fire that is hot enough to melt boulders.",
          affiliateLinks: [
            {
              site: "TCGPlayer",
              url: "https://example.com/charizard",
            },
          ],
          cardEffect: "This Pokémon is very powerful.",
        },
      },
      {
        id: uuidv4(),
        name: "Blastoise",
        slug: "blastoise",
        setId: set.id,
        details: {
          hp: "100",
          type: "Water",
          moves: [
            {
              cost: ["Water", "Water", "Water"],
              name: "Hydro Pump",
              damage: 120,
            },
          ],
          rarity: "Rare Holo",
          retreat: 3,
          cardType: "Pokémon",
          weakness: "Grass",
          setNumber: "2/102",
          cardEffect: "This Pokémon is very powerful.",
          flavorText: "It crushes its foe under its heavy body.",
          resistance: "Fire",
          illustrated: "Ken Sugimori",
          affiliateLinks: [
            {
              url: "https://example.com/blastoise",
              site: "TCGPlayer",
            },
          ],
        },
      },
      {
        id: uuidv4(),
        name: "Venusaur",
        slug: "venusaur",
        setId: set.id,
        details: {
          hp: "120",
          type: "Grass",
          moves: [
            {
              cost: ["Grass", "Grass", "Grass"],
              name: "Solar Beam",
              damage: 120,
            },
          ],
          rarity: "Rare Holo",
          retreat: 4,
          cardType: "Pokémon",
          weakness: "Fire",
          setNumber: "3/102",
          cardEffect: "This Pokémon is very powerful.",
          flavorText: "Its plant blooms when it absorbs solar energy.",
          resistance: "Water",
          illustrated: "Ken Sugimori",
          affiliateLinks: [
            {
              url: "https://example.com/venusaur",
              site: "TCGPlayer",
            },
          ],
        },
      },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("GET /v1/pokemon/eras", () => {
    it("should fetch all eras", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/eras")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: expect.any(String),
          name: "Original Series",
          slug: "original-series",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    it("should handle errors when fetching eras", async () => {
      jest
        .spyOn(sequelize.models.pkmnEra, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/eras")
        .expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokemon Eras" });
    });
  });

  describe("GET /v1/pokemon/eras/:identifier", () => {
    it("should fetch an era by its identifier", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/eras/original-series")
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: "Original Series",
        slug: "original-series",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        sets: [
          {
            id: expect.any(String),
            name: "Base Set",
            slug: "base-set",
            setImg: null,
            eraId: expect.any(String),
            releaseDate: "1999-01-09",
            totalCards: null,
            setCode: "BS-1",
            tcgId: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ],
      });
    });

    it("should return 404 if era is not found", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/eras/non-existent-era")
        .expect(404);

      expect(response.body).toEqual({
        error: 'Era not found with id or slug: "non-existent-era"',
      });
    });

    it("should handle errors when fetching an era by its identifier", async () => {
      jest
        .spyOn(sequelize.models.pkmnEra, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/eras/original-series")
        .expect(500);

      expect(response.body).toEqual({
        error: `Failed to fetch pokemon era with identifier "original-series"`,
      });
    });
  });

  describe("GET /v1/pokemon/sets", () => {
    it("should fetch all sets", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: expect.any(String), // UUID
          name: "Base Set",
          slug: "base-set",
          setImg: null,
          eraId: expect.any(String), // UUID
          releaseDate: "1999-01-09",
          totalCards: null,
          setCode: "BS-1",
          tcgId: expect.any(String), // UUID
          createdAt: expect.any(String), // Timestamp
          updatedAt: expect.any(String), // Timestamp
        },
      ]);
    });

    it("should handle errors when fetching sets", async () => {
      // Mock the findAll method to throw an error
      jest
        .spyOn(sequelize.models.pkmnSet, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/sets")
        .expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokemon sets." });
    });
  });

  describe("GET /v1/pokemon/sets/:identifier", () => {
    it("should fetch a set by its identifier", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets/base-set")
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String), // UUID
        name: "Base Set",
        slug: "base-set",
        setImg: null,
        eraId: expect.any(String), // UUID
        releaseDate: "1999-01-09",
        totalCards: null,
        setCode: "BS-1",
        tcgId: expect.any(String), // UUID
        createdAt: expect.any(String), // Timestamp
        updatedAt: expect.any(String), // Timestamp
        cards: expect.arrayContaining([
          {
            id: expect.any(String), // UUID
            name: "Charizard",
            slug: "charizard",
            setId: expect.any(String), // UUID
            details: {
              hp: "120",
              type: "Fire",
              moves: [
                {
                  cost: ["Fire", "Fire", "Fire"],
                  name: "Fire Spin",
                  damage: 100,
                },
              ],
              rarity: "Rare Holo",
              retreat: 3,
              cardType: "Pokémon",
              weakness: "Water",
              setNumber: "4/102",
              cardEffect: "This Pokémon is very powerful.",
              flavorText: "Spits fire that is hot enough to melt boulders.",
              resistance: "Fighting",
              illustrated: "Mitsuhiro Arita",
              affiliateLinks: [
                {
                  url: "https://example.com/charizard",
                  site: "TCGPlayer",
                },
              ],
            },
            createdAt: expect.any(String), // Timestamp
            updatedAt: expect.any(String), // Timestamp
          },
          {
            id: expect.any(String), // UUID
            name: "Blastoise",
            slug: "blastoise",
            setId: expect.any(String), // UUID
            details: {
              hp: "100",
              type: "Water",
              moves: [
                {
                  cost: ["Water", "Water", "Water"],
                  name: "Hydro Pump",
                  damage: 120,
                },
              ],
              rarity: "Rare Holo",
              retreat: 3,
              cardType: "Pokémon",
              weakness: "Grass",
              setNumber: "2/102",
              cardEffect: "This Pokémon is very powerful.",
              flavorText: "It crushes its foe under its heavy body.",
              resistance: "Fire",
              illustrated: "Ken Sugimori",
              affiliateLinks: [
                {
                  url: "https://example.com/blastoise",
                  site: "TCGPlayer",
                },
              ],
            },
            createdAt: expect.any(String), // Timestamp
            updatedAt: expect.any(String), // Timestamp
          },
          {
            id: expect.any(String), // UUID
            name: "Venusaur",
            slug: "venusaur",
            setId: expect.any(String), // UUID
            details: {
              hp: "120",
              type: "Grass",
              moves: [
                {
                  cost: ["Grass", "Grass", "Grass"],
                  name: "Solar Beam",
                  damage: 120,
                },
              ],
              rarity: "Rare Holo",
              retreat: 4,
              cardType: "Pokémon",
              weakness: "Fire",
              setNumber: "3/102",
              cardEffect: "This Pokémon is very powerful.",
              flavorText: "Its plant blooms when it absorbs solar energy.",
              resistance: "Water",
              illustrated: "Ken Sugimori",
              affiliateLinks: [
                {
                  url: "https://example.com/venusaur",
                  site: "TCGPlayer",
                },
              ],
            },
            createdAt: expect.any(String), // Timestamp
            updatedAt: expect.any(String), // Timestamp
          },
        ]),
      });
    });

    it("should handle errors when fetching a set by its identifier", async () => {
      // Mock the findOne method to throw an error
      jest
        .spyOn(sequelize.models.pkmnSet, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/sets/base-set")
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to fetch Pokemon set.",
      });
    });
  });

  describe("GET /v1/pokemon/cards", () => {
    it("should fetch all cards", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards")
        .expect(200);

      expect(response.body).toEqual({
        total: 3, // Updated to 3
        limit: 20,
        offset: 0,
        results: expect.arrayContaining([
          {
            id: expect.any(String), // UUID
            name: "Charizard",
            slug: "charizard",
            setId: expect.any(String), // UUID
            details: {
              hp: "120",
              type: "Fire",
              moves: [
                {
                  cost: ["Fire", "Fire", "Fire"],
                  name: "Fire Spin",
                  damage: 100,
                },
              ],
              rarity: "Rare Holo",
              retreat: 3,
              cardType: "Pokémon",
              weakness: "Water",
              setNumber: "4/102",
              cardEffect: "This Pokémon is very powerful.",
              flavorText: "Spits fire that is hot enough to melt boulders.",
              resistance: "Fighting",
              illustrated: "Mitsuhiro Arita",
              affiliateLinks: [
                {
                  url: "https://example.com/charizard",
                  site: "TCGPlayer",
                },
              ],
            },
            createdAt: expect.any(String), // Timestamp
            updatedAt: expect.any(String), // Timestamp
          },
          {
            id: expect.any(String), // UUID
            name: "Blastoise",
            slug: "blastoise",
            setId: expect.any(String), // UUID
            details: {
              hp: "100",
              type: "Water",
              moves: [
                {
                  cost: ["Water", "Water", "Water"],
                  name: "Hydro Pump",
                  damage: 120,
                },
              ],
              rarity: "Rare Holo",
              retreat: 3,
              cardType: "Pokémon",
              weakness: "Grass",
              setNumber: "2/102",
              cardEffect: "This Pokémon is very powerful.",
              flavorText: "It crushes its foe under its heavy body.",
              resistance: "Fire",
              illustrated: "Ken Sugimori",
              affiliateLinks: [
                {
                  url: "https://example.com/blastoise",
                  site: "TCGPlayer",
                },
              ],
            },
            createdAt: expect.any(String), // Timestamp
            updatedAt: expect.any(String), // Timestamp
          },
          {
            id: expect.any(String), // UUID
            name: "Venusaur",
            slug: "venusaur",
            setId: expect.any(String), // UUID
            details: {
              hp: "120",
              type: "Grass",
              moves: [
                {
                  cost: ["Grass", "Grass", "Grass"],
                  name: "Solar Beam",
                  damage: 120,
                },
              ],
              rarity: "Rare Holo",
              retreat: 4,
              cardType: "Pokémon",
              weakness: "Fire",
              setNumber: "3/102",
              cardEffect: "This Pokémon is very powerful.",
              flavorText: "Its plant blooms when it absorbs solar energy.",
              resistance: "Water",
              illustrated: "Ken Sugimori",
              affiliateLinks: [
                {
                  url: "https://example.com/venusaur",
                  site: "TCGPlayer",
                },
              ],
            },
            createdAt: expect.any(String), // Timestamp
            updatedAt: expect.any(String), // Timestamp
          },
        ]),
      });
    });

    it("should filter cards by a top-level field (name)", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?name[eq]=Charizard")
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      response.body.results.forEach((card: any) => {
        expect(card.name).toBe("Charizard");
      });
    });

    it("should filter cards by a top-level field with iLike (name)", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?name=Char")
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      response.body.results.forEach((card: any) => {
        expect(card.name.toLowerCase()).toContain("char");
      });
    });

    it("should filter cards by a nested field with eq (type)", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?type=Fire")
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      response.body.results.forEach((card: any) => {
        expect(card.details.type).toBe("Fire");
      });
    });

    it("should filter cards with operators (hp[gte]100)", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?hp[gte]=100")
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      response.body.results.forEach((card: any) => {
        expect(parseInt(card.details.hp)).toBeGreaterThanOrEqual(100);
      });
    });

    it("should filter cards with operators (hp[lt]=120)", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?hp[lt]=120")
        .expect(200);

      console.log(`\n\n\n\n\n\n${JSON.stringify(response)}\n\n\n\n\n`);

      expect(response.body.results.length).toBeGreaterThan(0);
      response.body.results.forEach((card: any) => {
        expect(parseInt(card.details.hp)).toBeLessThan(120);
      });
    });

    it("should filter cards with operators (type[eq]=Fire)", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?type[eq]=Fire")
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      response.body.results.forEach((card: any) => {
        expect(card.details.type).toBe("Fire");
      });
    });

    it("should handle errors when fetching cards", async () => {
      jest
        .spyOn(sequelize.models.pkmnCard, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/cards")
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to fetch Pokemon cards.",
      });
    });
  });

  describe("GET /v1/pokemon/cards/:identifier", () => {
    it("should fetch a card by its identifier", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards/charizard")
        .expect(200);

      expect(response.body).toEqual({
        id: expect.any(String), // UUID
        name: "Charizard",
        slug: "charizard",
        setId: expect.any(String), // UUID
        details: {
          hp: "120",
          type: "Fire",
          moves: [
            {
              cost: ["Fire", "Fire", "Fire"],
              name: "Fire Spin",
              damage: 100,
            },
          ],
          rarity: "Rare Holo",
          retreat: 3,
          cardType: "Pokémon",
          weakness: "Water",
          setNumber: "4/102",
          cardEffect: "This Pokémon is very powerful.",
          flavorText: "Spits fire that is hot enough to melt boulders.",
          resistance: "Fighting",
          illustrated: "Mitsuhiro Arita",
          affiliateLinks: [
            {
              url: "https://example.com/charizard",
              site: "TCGPlayer",
            },
          ],
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should handle errors when fetching a card by its identifier", async () => {
      jest
        .spyOn(sequelize.models.pkmnCard, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/cards/charizard")
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to fetch Pokemon card.",
      });
    });
  });
});
