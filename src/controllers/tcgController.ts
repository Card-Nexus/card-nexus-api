import { FastifyReply, FastifyRequest } from "fastify";
import {TCG} from '../models/tcgModels'
import { Op } from "sequelize";

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
      const tcg = await TCG.findOne({
        where: {
          [Op.or]: [{ id: identifier }, { slug: identifier }], // Search by id or slug
        },
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