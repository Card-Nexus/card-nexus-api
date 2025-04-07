import { JSONSchema7 } from "json-schema";

export const energyCostSchema: JSONSchema7 = {
  type: "object",
  required: ["type"],
  properties: {
    type: { type: "string" },
    amount: { type: "number" },
  },
};

export const moveSchema: JSONSchema7 = {
  type: "object",
  required: ["cost", "name", "description"],
  properties: {
    cost: {
      type: "array",
      items: energyCostSchema,
    },
    name: { type: "string" },
    description: { type: "string" },
    damage: { type: "string" },
    isGXAttack: { type: "boolean" },
    isVSTARAttack: { type: "boolean" },
  },
};

export const abilitySchema: JSONSchema7 = {
  type: "object",
  required: ["type", "name", "description"],
  properties: {
    type: { enum: ["ability", "poke-power", "poke-body", "vstar-power"] },
    name: { type: "string" },
    description: { type: "string" },
  },
};

export const weaknessResistanceSchema: JSONSchema7 = {
  type: "object",
  required: ["type", "modifier"],
  properties: {
    type: { type: "string" },
    modifier: { type: "string" },
  },
};

export const setInfoSchema: JSONSchema7 = {
  type: "object",
  required: ["name", "number", "rarity", "total_cards"],
  properties: {
    name: { type: "string" },
    number: { type: "string" },
    rarity: { type: "string" },
    total_cards: { type: "string" },
  },
};

export const affiliateLinkSchema: JSONSchema7 = {
  type: "object",
  required: ["site", "url"],
  properties: {
    site: { type: "string" },
    url: { type: "string" },
  },
};

// Base schema for all cards
export const cardDetailsSchema: JSONSchema7 = {
  type: "object",
  required: ["card_type", "set_info", "illustrator"],
  properties: {
    card_type: { enum: ["pokemon", "trainer", "energy"] },
    sub_types: {
      type: "array",
      items: { type: "string" },
    },
    set_info: setInfoSchema,
    illustrator: { type: "string" },
    github_image_url: { type: "string" },
    image_url: { type: "string" },
  },
};

// Pokemon-specific schema
export const pokemonDetailsSchema: JSONSchema7 = {
  allOf: [
    { $ref: "#/definitions/cardDetails" },
    {
      type: "object",
      required: ["type"],
      properties: {
        card_type: { const: "pokemon" },
        type: { type: "string" },
        hp: { type: ["number", "string"] },
        stage: { type: "string" },
        evolves_from: { type: "string" },
        evolves_into: { type: "string" },
        abilities: {
          type: "array",
          items: abilitySchema,
        },
        attacks: {
          type: "array",
          items: moveSchema,
        },
        weakness: weaknessResistanceSchema,
        resistance: weaknessResistanceSchema,
        retreat_cost: { type: "string" },
        flavor_text: { type: "string" },
        special_rules: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  ],
};

// Trainer-specific schema
export const trainerDetailsSchema: JSONSchema7 = {
  allOf: [
    { $ref: "#/definitions/cardDetails" },
    {
      type: "object",
      properties: {
        card_type: { const: "trainer" },
        rules_text: { type: "string" },
      },
    },
  ],
};

// Energy-specific schema
export const energyDetailsSchema: JSONSchema7 = {
  allOf: [
    { $ref: "#/definitions/cardDetails" },
    {
      type: "object",
      properties: {
        card_type: { const: "energy" },
        rules_text: { type: "string" },
      },
    },
  ],
};

// Main card schema
export const cardSchema: JSONSchema7 = {
  type: "object",
  required: ["id", "name", "slug", "setId", "details"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    slug: { type: "string" },
    setId: { type: "string", format: "uuid" },
    details: {
      oneOf: [pokemonDetailsSchema, trainerDetailsSchema, energyDetailsSchema],
    },
    affiliateLinks: {
      type: "array",
      items: affiliateLinkSchema,
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  definitions: {
    // Add definitions here
    cardDetails: cardDetailsSchema,
    energyCost: energyCostSchema,
    move: moveSchema,
    ability: abilitySchema,
    weaknessResistance: weaknessResistanceSchema,
    setInfo: setInfoSchema,
    affiliateLink: affiliateLinkSchema,
  },
};

// Schema for set response with cards
export const setWithCardsSchema: JSONSchema7 = {
  type: "object",
  required: ["id", "name", "slug", "cards"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    slug: { type: "string" },
    setImg: { type: "string" },
    eraId: { type: "string", format: "uuid" },
    releaseDate: { type: "string" },
    totalCards: { type: "number" },
    setCode: { type: "string" },
    tcgId: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    cards: {
      type: "array",
      items: {
        $ref: "#/definitions/card", // Refer to the card definition
      },
    },
  },
  definitions: {
    card: cardSchema, // Include the card schema definition
    cardDetails: cardDetailsSchema, // Also include cardDetails if cardSchema.$ref it directly
    energyCost: energyCostSchema,
    move: moveSchema,
    ability: abilitySchema,
    weaknessResistance: weaknessResistanceSchema,
    setInfo: setInfoSchema,
    affiliateLink: affiliateLinkSchema,
  },
};
