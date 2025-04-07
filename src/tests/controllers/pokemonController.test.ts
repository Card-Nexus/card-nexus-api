import supertest from "supertest";
import { app } from "../setup";
import { sequelize } from "../../config/database";
import { pkmnSet, pkmnEra, pkmnCard } from "./../../models/pokemonModels";
import { TCG } from "../../models/tcgModels";
import { v4 as uuidv4 } from "uuid";
import { setWithCardsSchema, cardSchema } from "../schemas/pokemonCard.schema";

describe("Pokemon Controller Tests", () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    console.log("Database connected successfully (in test file)");

    await TCG.sync({ force: true });
    await pkmnEra.sync({ force: true });
    await pkmnSet.sync({ force: true });
    await pkmnCard.sync({ force: true });

    try {
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

      const set = await pkmnSet.bulkCreate([
        {
          id: uuidv4(),
          name: "Base Set",
          slug: "base-set",
          eraId: era.id,
          releaseDate: "1999-01-09",
          setCode: "BS-1",
          tcgId: tcg.id,
          setImg: "base-set-image.jpg",
          totalCards: 102,
        },
        {
          id: uuidv4(),
          name: "Jungle",
          slug: "jungle",
          eraId: era.id,
          releaseDate: "1999-06-16",
          setCode: "JU-1",
          tcgId: tcg.id,
          setImg: "jungle-set-image.jpg",
          totalCards: 64,
        },
        {
          id: uuidv4(),
          name: "Fossil",
          slug: "fossil",
          eraId: era.id,
          releaseDate: "1999-10-10",
          setCode: "FO-1",
          tcgId: tcg.id,
          setImg: "fossil-set-image.jpg",
          totalCards: 62,
        },
      ]);

      await pkmnCard.bulkCreate([
        {
          id: uuidv4(),
          name: "Charizard",
          slug: "charizard",
          setId: set[0].id,
          details: {
            card_type: "pokemon",
            sub_types: [],
            hp: 120,
            type: "Fire",
            stage: "Stage 2",
            evolves_from: "Charmeleon",
            abilities: [],
            attacks: [
              {
                cost: [
                  { type: "Fire", amount: 1 },
                  { type: "Fire", amount: 1 },
                  { type: "Fire", amount: 1 },
                ],
                name: "Fire Spin",
                description: "Deals 100 damage",
                damage: "100",
              },
            ],
            weakness: { type: "Water", modifier: "×2" },
            resistance: { type: "Fighting", modifier: "-30" },
            retreat_cost: "3",
            flavor_text: "Spits fire that is hot enough to melt boulders.",
            special_rules: [],
            set_info: {
              name: "Base Set",
              number: "4/102",
              rarity: "Rare Holo",
              total_cards: "102",
            },
            illustrator: "Mitsuhiro Arita",
            github_image_url: "https://example.com/charizard.jpg",
          },
          affiliateLinks: [
            {
              site: "TCGPlayer",
              url: "https://example.com/charizard",
            },
          ],
        },
        {
          id: uuidv4(),
          name: "Blastoise",
          slug: "blastoise",
          setId: set[0].id,
          details: {
            card_type: "pokemon",
            sub_types: [],
            hp: 100,
            type: "Water",
            stage: "Stage 2",
            evolves_from: "Wartortle",
            abilities: [],
            attacks: [
              {
                cost: [
                  { type: "Water", amount: 1 },
                  { type: "Water", amount: 1 },
                  { type: "Water", amount: 1 },
                ],
                name: "Hydro Pump",
                description: "Deals 120 damage",
                damage: "120",
              },
            ],
            weakness: { type: "Grass", modifier: "×2" },
            resistance: { type: "Fire", modifier: "-30" },
            retreat_cost: "3",
            flavor_text: "It crushes its foe under its heavy body.",
            special_rules: [],
            set_info: {
              name: "Base Set",
              number: "2/102",
              rarity: "Rare Holo",
              total_cards: "102",
            },
            illustrator: "Ken Sugimori",
            github_image_url: "https://example.com/blastoise.jpg",
          },
          affiliateLinks: [
            {
              site: "TCGPlayer",
              url: "https://example.com/blastoise",
            },
          ],
        },
        {
          id: uuidv4(),
          name: "Venusaur",
          slug: "venusaur",
          setId: set[0].id,
          details: {
            card_type: "pokemon",
            sub_types: [],
            hp: 120,
            type: "Grass",
            stage: "Stage 2",
            evolves_from: "Ivysaur",
            abilities: [],
            attacks: [
              {
                cost: [
                  { type: "Grass", amount: 1 },
                  { type: "Grass", amount: 1 },
                  { type: "Grass", amount: 1 },
                ],
                name: "Solar Beam",
                description: "Deals 120 damage",
                damage: "120",
              },
            ],
            weakness: { type: "Fire", modifier: "×2" },
            resistance: { type: "Water", modifier: "-30" },
            retreat_cost: "4",
            flavor_text: "Its plant blooms when it absorbs solar energy.",
            special_rules: [],
            set_info: {
              name: "Base Set",
              number: "3/102",
              rarity: "Rare Holo",
              total_cards: "102",
            },
            illustrator: "Ken Sugimori",
            github_image_url: "https://example.com/venusaur.jpg",
          },
          affiliateLinks: [
            {
              site: "TCGPlayer",
              url: "https://example.com/venusaur",
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error creating test data:", error);
      throw error;
    }
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
    it("should fetch an era by its UUID", async () => {
      const era = await pkmnEra.findOne({ where: { slug: "original-series" } });
      const response = await supertest(app.server)
        .get(`/v1/pokemon/eras/${era?.id}`)
        .expect(200);

      expect(response.body.id).toBe(era?.id);
    });

    it("should fetch an era by its slug", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/eras/original-series")
        .expect(200);

      expect(response.body.slug).toBe("original-series");
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

      expect(response.body[0]).toEqual({
        id: expect.any(String),
        name: "Base Set",
        slug: "base-set",
        setImg: "base-set-image.jpg",
        eraId: expect.any(String),
        releaseDate: "1999-01-09",
        totalCards: 102,
        setCode: "BS-1",
        tcgId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should fetch all sets sorted by releaseDate in ascending order", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets?sort=releaseDate&order=asc")
        .expect(200);

      expect(response.body.length).toBe(3);
      expect(response.body[0].name).toBe("Base Set");
      expect(response.body[1].name).toBe("Jungle");
      expect(response.body[2].name).toBe("Fossil");
    });

    it("should fetch all sets sorted by releaseDate in descending order", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets?sort=releaseDate&order=desc")
        .expect(200);

      expect(response.body.length).toBe(3);
      expect(response.body[0].name).toBe("Fossil");
      expect(response.body[1].name).toBe("Jungle");
      expect(response.body[2].name).toBe("Base Set");
    });

    it("should fetch all sets without sorting", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets")
        .expect(200);

      expect(response.body.length).toBe(3);
    });

    it("should handle errors when fetching sets", async () => {
      jest
        .spyOn(sequelize.models.pkmnSet, "findAll")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await supertest(app.server)
        .get("/v1/pokemon/sets")
        .expect(500);

      expect(response.body).toEqual({ error: "Failed to fetch Pokemon sets." });
    });

    it("should fetch sets filtered by era", async () => {
      const era = await pkmnEra.findOne({ where: { slug: "original-series" } });
      const response = await supertest(app.server)
        .get(`/v1/pokemon/sets?era=${era?.id}`) 
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((set: any) => {
        expect(set.eraId).toBe(era?.id);
      });
    });

    it("should fetch sets filtered by name", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets?name=Base") 
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((set: any) => {
        expect(set.name.toLowerCase()).toContain("base");
      });
    });
  });

  describe("GET /v1/pokemon/sets/:identifier", () => {
    it("should fetch a set by its identifier with valid cards", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets/base-set")
        .expect(200);
    
      expect(response.body).toMatchSchema(setWithCardsSchema);
    
      expect(response.body).toMatchObject({
        name: "Base Set",
        slug: "base-set",
      });
    
      expect(Array.isArray(response.body.cards)).toBe(true);
      expect(response.body.cards.length).toBeGreaterThan(0);
    
      response.body.cards.forEach((card: any) => {
        expect(card).toMatchSchema(cardSchema);
      });
    
      const charizardCard = response.body.cards.find(
        (card: any) => card.name === "Charizard"
      );
      expect(charizardCard).toBeDefined();
      if (charizardCard) {
        expect(charizardCard).toMatchObject({
          name: "Charizard",
          details: expect.objectContaining({
            card_type: "pokemon",
            type: "Fire", 
            attacks: expect.arrayContaining([
              expect.objectContaining({
                name: "Fire Spin",
                damage: "100", 
              }),
            ]),
           
          }),
        });
      }
    });

    it("should handle errors when fetching a set by its identifier", async () => {
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

    it("should fetch a set by its UUID", async () => {
      const set = await pkmnSet.findOne({ where: { slug: "base-set" } });
      const response = await supertest(app.server)
        .get(`/v1/pokemon/sets/${set?.id}`)
        .expect(200);

      expect(response.body.id).toBe(set?.id);
    });

    it("should fetch a set by its slug", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets/base-set")
        .expect(200);

      expect(response.body.slug).toBe("base-set");
    });

    it("should return 404 if set is not found", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/sets/non-existent-set")
        .expect(404);

      expect(response.body).toEqual({ error: "Set not found." });
    });
  });

  describe("GET /v1/pokemon/cards", () => {
    it("should fetch all cards", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards")
        .expect(200);
    
      response.body.results.forEach((card: any) => {
        expect(card).toMatchSchema(cardSchema);
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

    it("should fetch cards with pagination", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards?limit=1&offset=0") 
        .expect(200);

      expect(response.body.results.length).toBe(1);
      expect(response.body.total).toBe(3);
    });

    it("should fetch a card by its UUID", async () => {
      const card = await pkmnCard.findOne({ where: { slug: "charizard" } });
      const response = await supertest(app.server)
        .get(`/v1/pokemon/cards/${card?.id}`)
        .expect(200);

      expect(response.body.id).toBe(card?.id);
    });

    it("should fetch a card by its slug", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards/charizard")  
        .expect(200);

      expect(response.body.slug).toBe("charizard");
    });

    it("should return 404 if card is not found", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards/non-existent-card") 
        .expect(404);

      expect(response.body).toEqual({ error: "Card not found." });
    });
  });

  describe("GET /v1/pokemon/cards/:identifier", () => {
    it("should fetch a card by its identifier", async () => {
      const response = await supertest(app.server)
        .get("/v1/pokemon/cards/charizard") 
        .expect(200);
    
      expect(response.body).toMatchSchema(cardSchema);
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
