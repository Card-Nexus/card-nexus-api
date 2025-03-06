import { pkmnSet, pkmnEra, pkmnCard } from "../../../models/pokemonModels";
import { TCG } from "../../../models/tcgModels";
import { sequelize } from "../../../config/database";
import { v4 as uuidv4 } from "uuid";

describe("Pokemon Set Model", () => {
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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  //////////////// pkmnSet ////////////////
  test("should create a pkmnSet successfully", async () => {
    try {
      const newSet = await pkmnSet.create({
        id: uuidv4(),
        name: "Base Set",
        slug: "base-set",
        eraId: testEra.id,
        releaseDate: "1999-01-09",
        setCode: "BS1",
        tcgId: testTCG.id,
      });

      expect(newSet).toBeDefined();
      expect(newSet.name).toBe("Base Set");
      expect(newSet.slug).toBe("base-set");
    } catch (error) {
      console.error("Test Error:", error);
      throw error;
    }
  });

  test("should not allow creating a pkmnSet without required fields", async () => {
    await expect(
      pkmnSet.create({
        name: "Jungle",
      } as any)
    ).rejects.toThrow();
  });
});