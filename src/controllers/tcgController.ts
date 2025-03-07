import { FastifyReply, FastifyRequest } from "fastify";
import {TCG} from '../models/tcgModels'
import { Op } from "sequelize";
import { isUUID } from "validator";

interface TCGParams {
    identifier: string;
}

export const getAllTCGs = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tcgs = await TCG.findAll(); // Fetch all TCG entries from the database
      return reply.send(tcgs);
    } catch (error) {
      reply.status(500).send({ error: "Failed to fetch TCGs" });
    }
};

export const getTCGByIdentifier = async (request: FastifyRequest<{ Params: TCGParams }>, reply: FastifyReply) => {
    const { identifier } = request.params;
  
    try {
      const whereClause: any = isUUID(identifier, 4)
            ? { id: identifier }
            : { slug: identifier };
      const tcg = await TCG.findOne({
        where: whereClause,
      });
  
      if (tcg) {
        return reply.send(tcg); // If found, return the TCG
      } else {
        reply.status(404).send({ error: "TCG not found" }); // TCG not found
      }
    } catch (error) {
      reply.status(500).send({ error: "Failed to fetch TCG" }); // Error
    }
  };