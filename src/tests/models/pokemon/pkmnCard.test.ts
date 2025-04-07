import {
  pkmnSet,
  pkmnEra,
  pkmnCard,
  pkmnCardAttributes,
  PkmnCardDetails,
} from "../../../models/pokemonModels";
import { TCG } from "../../../models/tcgModels";
import { sequelize } from "../../../config/database";
import { v4 as uuidv4 } from "uuid";

describe("Pokemon Card Model", () => {
  let testSet: pkmnSet;
  let testEra: pkmnEra;
  let testTCG: TCG;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    testEra = await pkmnEra.create({
      id: uuidv4(),
      name: "Base Era",
      slug: "base-era",
    });

    // Create a TCG with a valid UUID
    testTCG = await TCG.create({
      id: uuidv4(),
      name: "Pokemon TCG",
      slug: "pokemon-tcg",
      img: "http://example.com/images/icon",
    });

    testSet = await pkmnSet.create({
      id: uuidv4(),
      name: "Test Set",
      slug: "test-set",
      eraId: testEra.id,
      releaseDate: "2022-01-01",
      setCode: "TS1",
      setImg: "http://example.com/images/",
      tcgId: testTCG.id,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a pkmnCard successfully", async () => {
    const cardDetails: PkmnCardDetails = {
      card_type: "pokemon",
      sub_types: [],
      hp: 100,
      type: "Fire",
      stage: "Basic",
      abilities: [],
      attacks: [
        {
          cost: [
            { type: "Fire", amount: 1 },
            { type: "Colorless", amount: 1 },
          ],
          name: "Flamethrower",
          description: "Deals 90 damage",
          damage: "90",
        },
      ],
      weakness: { type: "Water", modifier: "×2" },
      resistance: { type: "Grass", modifier: "-30" },
      retreat_cost: "1",
      flavor_text: "A fiery Pokémon",
      special_rules: [],
      set_info: {
        name: "Test Set",
        number: "001/100",
        rarity: "Rare",
        total_cards: "100",
      },
      illustrator: "John Doe",
      github_image_url: "https://example.com/flareon.jpg",
    };

    const testCard = await pkmnCard.create({
      id: uuidv4(),
      name: "Flareon",
      slug: "flareon-001",
      setId: testSet.id,
      details: cardDetails,
    });

    expect(testCard).toBeDefined();
    expect(testCard.name).toBe("Flareon");
    expect(testCard.slug).toBe("flareon-001");
    expect(testCard.setId).toBe(testSet.id);
    expect(testCard.details.hp).toBe(100);
    expect(testCard.details.card_type).toBe("pokemon");
    expect(testCard.details.attacks[0].name).toBe("Flamethrower");
  });

  it("should not create a pkmnCard without required fields", async () => {
    try {
      // Using type assertion to bypass the TypeScript type checking for missing required fields
      await pkmnCard.create({
        id: uuidv4(),
        name: "Invalid Card",
        // Casting to the model type while omitting required fields
      } as unknown as pkmnCardAttributes); // Type assertion to avoid TS type check errors
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);

      // Ensure the error contains "notNull Violation"
      expect(error.message).toContain("notNull Violation");

      if (error.name === "SequelizeValidationError") {
        // Check the specific errors for missing fields
        expect(error.errors[0].message).toContain(
          "pkmnCard.slug cannot be null"
        );
        expect(error.errors[1].message).toContain(
          "pkmnCard.setId cannot be null"
        );
        expect(error.errors[2].message).toContain(
          "pkmnCard.details cannot be null"
        );
        expect(error.errors[0].path).toBe("slug");
        expect(error.errors[1].path).toBe("setId");
        expect(error.errors[2].path).toBe("details");
      }
    }
  });

  it("should associate with the pkmnSet model", async () => {
    const testCard = await pkmnCard.create({
      id: uuidv4(),
      name: "Pikachu",
      slug: "pikachu-001",
      setId: testSet.id,
      details: {
        card_type: "pokemon",
        sub_types: [],
        hp: 60,
        type: "Electric",
        stage: "Basic",
        abilities: [],
        attacks: [
          {
            cost: [
              { type: "Electric", amount: 1 },
              { type: "Colorless", amount: 1 },
            ],
            name: "Thunderbolt",
            description: "Deals 50 damage",
            damage: "50",
          },
        ],
        set_info: {
          name: "Test Set",
          number: "002/100",
          rarity: "Common",
          total_cards: "100",
        },
        illustrator: "Jane Doe",
        github_image_url: "https://example.com/pikachu.jpg",
      },
    });

    expect(testCard.setId).toBe(testSet.id);
  });

  it("should store the details field as JSONB type", async () => {
    const cardDetails: PkmnCardDetails = {
      card_type: "pokemon",
      sub_types: ["ex"],
      hp: 90,
      type: "Water",
      stage: "Stage 1",
      abilities: [
        {
          type: "ability",
          name: "Torrent",
          description: "Boosts water attacks when HP is low",
        },
      ],
      attacks: [
        {
          cost: [{ type: "Water", amount: 1 }],
          name: "Bubble Beam",
          description: "Deals 30 damage",
          damage: "30",
        },
      ],
      set_info: {
        name: "Test Set",
        number: "003/100",
        rarity: "Uncommon",
        total_cards: "100",
      },
      illustrator: "Mark Lee",
      github_image_url: "https://example.com/squirtle.jpg",
    };

    const testCard = await pkmnCard.create({
      id: uuidv4(),
      name: "Squirtle",
      slug: "squirtle-003",
      setId: testSet.id,
      details: cardDetails,
    });

    expect(testCard.details).toEqual(cardDetails);
    expect(testCard.details.sub_types).toContain("ex");
    expect(testCard.details.abilities[0].name).toBe("Torrent");
  });
});
