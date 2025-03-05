import { FastifyReply, FastifyRequest } from "fastify";
import { Op } from "sequelize";
import {pkmnEra, pkmnSet, pkmnCard} from "./../models/pokemonModels"

// Get all eras
export const getAllEras = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const eras = await pkmnEra.findAll()
        return reply.send(eras)
    } catch (error) {
        return reply.status(500).send({error: "Failed to fetch Pokemon Eras"})
    }
}

// Get specific era by id or slug
export const getEraByIdentifier = async (request: FastifyRequest<{Params: {identifier: string}}>, reply: FastifyReply) => {
    try {
        const {identifier} = request.params
        const era = await pkmnEra.findOne({
            where: {
                [Op.or]: [{id: identifier}, {slug: identifier}]
            }
        })

        if (!era) return reply.status(404).send({error: `Era not found with id or slug: "${request.params}"`})
    
        return reply.send(era)
    
    } catch (error) {
        return reply.status(500).send({error: `Failed to fetch pokemon era with identifier "${request.params}"`})
    }
}

// Get all pokemon sets with optional filters
export const getAllSets = async (req: FastifyRequest<{ Querystring: { era?: string; name?: string } }>, reply: FastifyReply) => {
    try {
      const { era, name } = req.query;
      const whereClause: any = {};
  
      if (era) whereClause.eraId = era;
      if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
  
      const sets = await pkmnSet.findAll({ where: whereClause });
      return reply.send(sets);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch Pokémon sets." });
    }
  };
  
  // Get specific set by ID or slug
  export const getSetByIdentifier = async (req: FastifyRequest<{ Params: { identifier: string } }>, reply: FastifyReply) => {
    try {
      const { identifier } = req.params;
      const set = await pkmnSet.findOne({
        where: {
          [Op.or]: [{ id: identifier }, { slug: identifier }],
        },
      });
  
      if (!set) return reply.status(404).send({ error: "Set not found." });
      return reply.send(set);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch Pokémon set." });
    }
  };
  
  // Get all Pokémon cards (with filtering)
  export const getAllCards = async (
    req: FastifyRequest<{ Querystring: Record<string, string> }>,
    reply: FastifyReply
  ) => {
    try {
      const filters = req.query;
      const whereClause: any = {};
  
      const topLevelFields = ["id", "name", "slug", "setId"];
  
      Object.entries(filters).forEach(([key, value]) => {
        if (topLevelFields.includes(key)) {
          whereClause[key] = { [Op.iLike]: `%${value}%` };
        } else {
          whereClause[`details.${key}`] = { [Op.eq]: value };
        }
      });
  
      const cards = await pkmnCard.findAll({ where: whereClause });
      return reply.send(cards);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch Pokémon cards." });
    }
  };
  
  // Get specific card by ID or slug
  export const getCardByIdentifier = async (req: FastifyRequest<{ Params: { identifier: string } }>, reply: FastifyReply) => {
    try {
      const { identifier } = req.params;
      const card = await pkmnCard.findOne({
        where: {
          [Op.or]: [{ id: identifier }, { slug: identifier }],
        },
      });
  
      if (!card) return reply.status(404).send({ error: "Card not found." });
      return reply.send(card);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch Pokémon card." });
    }
  };