import { FastifyInstance } from "fastify";
import fastify from "fastify";
import supertest from "supertest";
import pokemonRoutes from "../../routes/pokemonRoutes";
import { pkmnEra, pkmnSet, pkmnCard } from "../../models/pokemonModels";
import { TCG } from "../../models/tcgModels";
import { sequelize } from "../../config/database";

describe("Pokemon Controller Tests", () => {
  let app: FastifyInstance;
  let tcgId: string;
  
  beforeAll(async () => {
    app = fastify();
    app.register(pokemonRoutes);

    await sequelize.sync({ force: true });

    const tcg = await TCG.create({
      id: "550e8400-e29b-41d4-a716-446655440000", // Example UUID
      name: "Pokémon TCG",
      slug: "pokemon-tcg",
      img: "https://example.com/tcg.jpg",
    });
    tcgId = tcg.id;

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await sequelize.close();
  });

  describe("getAllEras", () => {
    it("should fetch all eras", async () => {
      // Seed the database with some test data
      await pkmnEra.create({ id: "1", name: "Base Set", slug: "base-set" });

      const response = await supertest(app.server).get("/eras").expect(200);

      expect(response.body).toEqual([
        { id: "1", name: "Base Set", slug: "base-set" },
      ]);
    });

    it("should handle errors when fetching eras", async () => {
      // Mock the findAll method to throw an error
      jest
        .spyOn(pkmnEra, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server).get("/eras").expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokemon Eras" });
    });
  });

  describe("getEraByIdentifier", () => {
    it("should fetch an era by id", async () => {
      await pkmnEra.create({ id: "1", name: "Base Set", slug: "base-set" });

      const response = await supertest(app.server).get("/eras/1").expect(200);

      expect(response.body).toEqual({
        id: "1",
        name: "Base Set",
        slug: "base-set",
      });
    });

    it("should fetch an era by slug", async () => {
      await pkmnEra.create({ id: "1", name: "Base Set", slug: "base-set" });

      const response = await supertest(app.server)
        .get("/eras/base-set")
        .expect(200);

      expect(response.body).toEqual({
        id: "1",
        name: "Base Set",
        slug: "base-set",
      });
    });

    it("should return 404 if era not found", async () => {
      const response = await supertest(app.server)
        .get("/eras/non-existent")
        .expect(404);

      expect(response.body).toEqual({
        error: 'Era not found with id or slug: "non-existent"',
      });
    });

    it("should handle errors when fetching era by identifier", async () => {
      jest
        .spyOn(pkmnEra, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server).get("/eras/1").expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch pokemon era with identifier "1"',
      });
    });
  });

  describe("getAllSets", () => {
    it("should fetch all sets", async () => {
      await pkmnSet.create({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });

      const response = await supertest(app.server).get("/sets").expect(200);

      expect(response.body).toEqual([
        {
          id: "1",
          name: "Base Set",
          slug: "base-set",
          eraId: "1",
          releaseDate: "1999-01-09",
          setCode: "BS-1",
          tcgId: tcgId,
        },
      ]);
    });

    it("should filter sets by era", async () => {
      await pkmnSet.create({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });
      await pkmnSet.create({
        id: "2",
        name: "Jungle",
        slug: "jungle",
        eraId: "2",
        releaseDate: "1999-06-16",
        setCode: "JU-1",
        tcgId: tcgId,
      });

      const response = await supertest(app.server)
        .get("/sets?era=1")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: "1",
          name: "Base Set",
          slug: "base-set",
          eraId: "1",
          releaseDate: "1999-01-09",
          setCode: "BS-1",
          tcgId: tcgId,
        },
      ]);
    });

    it("should filter sets by name", async () => {
      await pkmnSet.create({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });
      await pkmnSet.create({
        id: "2",
        name: "Jungle",
        slug: "jungle",
        eraId: "2",
        releaseDate: "1999-06-16",
        setCode: "JU-1",
        tcgId: tcgId,
      });

      const response = await supertest(app.server)
        .get("/sets?name=jungle")
        .expect(200);

      expect(response.body).toEqual([
        {
          id: "2",
          name: "Jungle",
          slug: "jungle",
          eraId: "2",
          releaseDate: "1999-06-16",
          setCode: "JU-1",
          tcgId: tcgId,
        },
      ]);
    });

    it("should handle errors when fetching sets", async () => {
      jest
        .spyOn(pkmnSet, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server).get("/sets").expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokémon sets." });
    });
  });

  describe("getSetByIdentifier", () => {
    it("should fetch a set by id", async () => {
      await pkmnSet.create({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });

      const response = await supertest(app.server).get("/sets/1").expect(200);

      expect(response.body).toEqual({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });
    });

    it("should fetch a set by slug", async () => {
      await pkmnSet.create({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });

      const response = await supertest(app.server)
        .get("/sets/base-set")
        .expect(200);

      expect(response.body).toEqual({
        id: "1",
        name: "Base Set",
        slug: "base-set",
        eraId: "1",
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcgId,
      });
    });

    it("should return 404 if set not found", async () => {
      const response = await supertest(app.server)
        .get("/sets/non-existent")
        .expect(404);

      expect(response.body).toEqual({ error: "Set not found." });
    });

    it("should handle errors when fetching set by identifier", async () => {
      jest
        .spyOn(pkmnSet, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server).get("/sets/1").expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokémon set." });
    });
  });

  describe("getAllCards", () => {
    it("should fetch all cards", async () => {
      await pkmnCard.create({
        id: "1",
        name: "Charizard",
        slug: "charizard",
        setId: "1",
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
      });

      const response = await supertest(app.server).get("/cards").expect(200);

      expect(response.body).toEqual({
        total: 1,
        limit: 20,
        offset: 0,
        results: [
          {
            id: "1",
            name: "Charizard",
            slug: "charizard",
            setId: "1",
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
        ],
      });
    });

    it("should filter cards by name", async () => {
      await pkmnCard.create({
        id: "1",
        name: "Charizard",
        slug: "charizard",
        setId: "1",
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
      });
      await pkmnCard.create({
        id: "2",
        name: "Blastoise",
        slug: "blastoise",
        setId: "1",
        details: {
          hp: "100",
          type: "Water",
          cardType: "Pokémon",
          setNumber: "2/102",
          moves: [
            {
              cost: ["Water", "Water", "Water"],
              name: "Hydro Pump",
              damage: 80,
            },
          ],
          weakness: "Grass",
          resistance: "Fire",
          retreat: 2,
          illustrated: "Mitsuhiro Arita",
          rarity: "Rare Holo",
          flavorText:
            "A brutal Pokémon with pressurized water jets on its shell.",
          affiliateLinks: [
            {
              site: "TCGPlayer",
              url: "https://example.com/blastoise",
            },
          ],
          cardEffect: "This Pokémon is very powerful.",
        },
      });

      const response = await supertest(app.server)
        .get("/cards?name=charizard")
        .expect(200);

      expect(response.body.results).toEqual([
        {
          id: "1",
          name: "Charizard",
          slug: "charizard",
          setId: "1",
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
      ]);
    });

    it("should handle errors when fetching cards", async () => {
      jest
        .spyOn(pkmnCard, "findAndCountAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server).get("/cards").expect(500);

      expect(response.body).toEqual({
        error: "Failed to fetch Pokémon cards.",
      });
    });
  });

  describe("getCardByIdentifier", () => {
    it("should fetch a card by id", async () => {
      await pkmnCard.create({
        id: "1",
        name: "Charizard",
        slug: "charizard",
        setId: "1",
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
      });

      const response = await supertest(app.server).get("/cards/1").expect(200);

      expect(response.body).toEqual({
        id: "1",
        name: "Charizard",
        slug: "charizard",
        setId: "1",
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
      });
    });

    it("should fetch a card by slug", async () => {
      await pkmnCard.create({
        id: "1",
        name: "Charizard",
        slug: "charizard",
        setId: "1",
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
      });

      const response = await supertest(app.server)
        .get("/cards/charizard")
        .expect(200);

      expect(response.body).toEqual({
        id: "1",
        name: "Charizard",
        slug: "charizard",
        setId: "1",
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
      });
    });

    it("should return 404 if card not found", async () => {
      const response = await supertest(app.server)
        .get("/cards/non-existent")
        .expect(404);

      expect(response.body).toEqual({ error: "Card not found." });
    });

    it("should handle errors when fetching card by identifier", async () => {
      jest
        .spyOn(pkmnCard, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server).get("/cards/1").expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokémon card." });
    });
  });
});
