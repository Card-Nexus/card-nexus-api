import { sequelize } from "./../../config/database";
import { pkmnEra, pkmnSet, pkmnCard } from "../../models/pokemonModels";
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

    const set = await pkmnSet.bulkCreate([
      {
        id: uuidv4(),
        name: "Base Set",
        slug: "base-set",
        eraId: era.id,
        releaseDate: "1999-01-09",
        setCode: "BS-1",
        tcgId: tcg.id,
      },
      {
        id: uuidv4(),
        name: "Jungle",
        slug: "jungle",
        eraId: era.id,
        releaseDate: "1999-06-16",
        setCode: "JU-1",
        tcgId: tcg.id,
      },
      {
        id: uuidv4(),
        name: "Fossil",
        slug: "fossil",
        eraId: era.id,
        releaseDate: "1999-10-10",
        setCode: "FO-1",
        tcgId: tcg.id,
      },
    ], {transaction});

    await pkmnCard.bulkCreate([
      {
        id: uuidv4(),
        name: "Charizard",
        slug: "charizard",
        setId: set[0].id,
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
        setId: set[0].id,
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
        setId: set[0].id,
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
    ], {transaction});

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
  } finally {
    await sequelize.close();
  }
};