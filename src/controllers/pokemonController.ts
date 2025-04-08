import { FastifyReply, FastifyRequest } from "fastify";
import { Op, Sequelize } from "sequelize";
import { pkmnEra, pkmnSet, pkmnCard, pkmnEraAttributes, pkmnSetAttributes, pkmnCardAttributes } from "./../models/pokemonModels";
import { TCG } from "./../models/tcgModels";
import { isUUID } from "validator";
import { Optional, CreationAttributes } from "sequelize";

// Get all eras
export const getAllEras = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const eras = await pkmnEra.findAll();
    return reply.send(eras);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch Pokemon Eras" });
  }
};

// Get specific era by id or slug
export const getEraByIdentifier = async (
  request: FastifyRequest<{ Params: { identifier: string } }>,
  reply: FastifyReply
) => {
  try {
    const { identifier } = request.params;

    const whereClause: any = isUUID(identifier, 4)
      ? { id: identifier }
      : { slug: identifier };

    const era = await pkmnEra.findOne({
      where: whereClause,
      include: [{ model: pkmnSet, as: "sets" }],
      logging: console.log,
    });

    if (!era)
      return reply
        .status(404)
        .send({ error: `Era not found with id or slug: "${identifier}"` });

    return reply.send(era);
  } catch (error) {
    const { identifier } = request.params;
    return reply.status(500).send({
      error: `Failed to fetch pokemon era with identifier "${identifier}"`,
    });
  }
};

// Post Era

export const postEra = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, slug } = request.body as Pick<CreationAttributes<pkmnEra>, 'name' | 'slug'>;
    const era = await pkmnEra.create({ name, slug } as any);
    reply.status(201).send(era);
  } catch (error) {
    console.error("Error creating Pokemon Era:", error);
    reply.status(500).send({ error: "Failed to create Pokemon Era" });
  }
};

// Get all pokemon sets with optional filters
export const getAllSets = async (
  req: FastifyRequest<{
    Querystring: {
      era?: string;
      name?: string;
      sort?: string;
      order?: "asc" | "desc";
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { era, name, sort, order } = req.query;
    const whereClause: any = {};
    const orderClause: any[] = [];

    if (era) whereClause.eraId = era;
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };

    if (sort === "releaseDate") {
      orderClause.push(["releaseDate", order === "desc" ? "DESC" : "ASC"]);
    }

    const sets = await pkmnSet.findAll({
      where: whereClause,
      order: orderClause.length ? orderClause : undefined,
    });
    return reply.send(sets);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch Pokemon sets." });
  }
};

// Get specific set by ID or slug
export const getSetByIdentifier = async (
  req: FastifyRequest<{ Params: { identifier: string } }>,
  reply: FastifyReply
) => {
  try {
    const { identifier } = req.params;

    const whereClause: any = isUUID(identifier, 4)
      ? { id: identifier }
      : { slug: identifier };

    const set = await pkmnSet.findOne({
      include: [
        {
          model: pkmnCard,
          as: "cards",
          order: [
            Sequelize.literal(
              `CAST(SPLIT_PART("setNumber", '/', 1) AS INTEGER)`
            ),
            "ASC",
          ],
        },
      ],
      where: whereClause,
    });

    if (!set) return reply.status(404).send({ error: "Set not found." });
    return reply.send(set);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch Pokemon set." });
  }
};

// Post set

export const postSet = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, slug, setImg, eraId, releaseDate, totalCards, setCode, tcgId } = request.body as Omit<pkmnSetAttributes, 'id' | 'createdAt' | 'updatedAt'>;
    const set = await pkmnSet.create(request.body as any);
    reply.status(201).send(set);
  } catch (error) {
    console.error("Error creating Pokemon Set:", error);
    reply.status(500).send({ error: "Failed to create Pokemon Set" });
  }
};

// Get all Pokémon cards (with filtering)
export const getAllCards = async (
  req: FastifyRequest<{ Querystring: Record<string, string> }>,
  reply: FastifyReply
) => {
  try {
    const { limit, offset, ...filters } = req.query;
    const whereClause: any = {};

    const topLevelFields = ["id", "name", "slug", "setId"];
    Object.entries(filters).forEach(([key, value]) => {
      const match = key.match(
        /(.*?)__(gte|lte|gt|lt|eq)$|(.+?)\[(gte|lte|gt|lt|eq)\]$/
      );
      if (match) {
        const field = match[1] || match[3];
        const operator = match[2] || match[4];

        const sequelizeOperators: Record<string, symbol> = {
          gte: Op.gte,
          lte: Op.lte,
          gt: Op.gt,
          lt: Op.lt,
          eq: Op.eq,
        };
        console.log(
          `\n\n\n\nMATCH:${match}\nFIELD:${field}\nOPERATOR:${operator}\n`
        );
        if (sequelizeOperators[operator]) {
          const numericValue = field === "hp" ? parseFloat(value) : value;
          if (topLevelFields.includes(field)) {
            whereClause[field] = {
              [sequelizeOperators[operator]]: numericValue,
            };
          } else {
            whereClause.details = {
              ...whereClause.details,
              [field]: { [sequelizeOperators[operator]]: numericValue },
            };
          }
        }
      } else {
        if (topLevelFields.includes(key)) {
          whereClause[key] = { [Op.iLike]: `%${value}%` };
        } else {
          whereClause.details = {
            ...whereClause.details,
            [key]: { [Op.eq]: value },
          };
        }
      }
    });

    // Convert limit/offset to numbers & enforce defaults
    const limitNum = limit ? Math.max(1, Number(limit)) : 20; // Default: 20 per page
    const offsetNum = offset ? Math.max(0, Number(offset)) : 0;

    const { rows: cards, count } = await pkmnCard.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offsetNum,
    });

    return reply.send({
      total: count,
      limit: limitNum,
      offset: offsetNum,
      results: cards,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Failed to fetch Pokemon cards." });
  }
};

// Get specific card by ID or slug
export const getCardByIdentifier = async (
  req: FastifyRequest<{ Params: { identifier: string } }>,
  reply: FastifyReply
) => {
  try {
    const { identifier } = req.params;

    const whereClause: any = isUUID(identifier, 4)
      ? { id: identifier }
      : { slug: identifier };

    const card = await pkmnCard.findOne({
      where: whereClause,
    });

    if (!card) return reply.status(404).send({ error: "Card not found." });
    return reply.send(card);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch Pokemon card." });
  }
};

// Post cards 

export const postCard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // const { name, slug, setNumber, artist, rarity, flavorText, cardType, hp, details, images, setId } = request.body as any;
    const card = await pkmnCard.create(request.body as any);
    reply.status(201).send(card);
  } catch (error) {
    console.error("Error creating Pokemon Card:", error);
    reply.status(500).send({ error: "Failed to create Pokemon Card" });
  }
};

// Bulk create Pokemon Cards (for posting multiple cards for a set)
export const postCardsBulk = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cardsData = request.body as any;
    const createdCards = await pkmnCard.bulkCreate(cardsData as any);
    reply.status(201).send(createdCards);
  } catch (error) {
    console.error("Error creating Pokemon Cards in bulk:", error);
    reply.status(500).send({ error: "Failed to create Pokemon Cards in bulk" });
  }
};