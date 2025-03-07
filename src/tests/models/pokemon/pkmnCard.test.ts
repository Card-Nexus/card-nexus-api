import {
  pkmnSet,
  pkmnEra,
  pkmnCard,
  pkmnCardAttributes,
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
    const cardDetails = {
      hp: "100",
      type: "Fire",
      cardType: "Basic",
      setNumber: "001",
      moves: [
        { name: "Flamethrower", cost: ["Fire", "Colorless"], damage: 90 },
      ],
      illustrated: "John Doe",
      rarity: "Rare",
      cardEffect: "Burns opponent's Pokémon",
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
    expect(testCard.details.hp).toBe("100");
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
        hp: "60",
        type: "Electric",
        cardType: "Basic",
        setNumber: "002",
        moves: [
          { name: "Thunderbolt", cost: ["Electric", "Colorless"], damage: 50 },
        ],
        illustrated: "Jane Doe",
        rarity: "Common",
        cardEffect: "Paralyzes opponent's Pokémon",
      },
    });

    expect(testCard.setId).toBe(testSet.id);
  });

  it("should store the details field as JSONB type", async () => {
    const cardDetails = {
      hp: "90",
      type: "Water",
      cardType: "Stage 1",
      setNumber: "003",
      moves: [
        { name: "Bubble Beam", cost: ["Water", "Colorless"], damage: 30 },
      ],
      illustrated: "Mark Lee",
      rarity: "Uncommon",
      cardEffect: "May cause confusion",
    };

    const testCard = await pkmnCard.create({
      id: uuidv4(),
      name: "Squirtle",
      slug: "squirtle-003",
      setId: testSet.id,
      details: cardDetails,
    });

    expect(testCard.details).toEqual(cardDetails);
  });
});
