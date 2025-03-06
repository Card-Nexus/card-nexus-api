import { sequelize } from "./../../config/database";
import { pkmnEra, pkmnSet, PkmnCard } from "../../models/pokemonModels";
import { TCG } from "../../models/tcgModels";
import { v4 as uuidv4 } from "uuid";

export const seedPokemonData = async () => {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.sync();

    const tcg = await TCG.create(
      {
        id: uuidv4(),
        name: "Pokémon TCG",
        slug: "pokemon-tcg",
        img: "https://example.com/tcg.jpg",
      },
      { transaction }
    );

    const era = await pkmnEra.create(
      {
        id: uuidv4(),
        name: "Original Series",
        slug: "original-series",
      },
      { transaction }
    );

    const set = await pkmnSet.create(
      {
        id: uuidv4(),
        name: "Base Set",
        slug: "base-set",
        eraId: era.id,
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcg.id,
      },
      { transaction }
    );

    const card = await PkmnCard.create(
      {
        id: uuidv4(),
        name: "Charizard",
        slug: "charizard",
        setId: set.id, // Reference the set's ID
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
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
  } finally {
    await sequelize.close();
  }
};