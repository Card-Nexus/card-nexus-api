import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import TCG from "./tcgModels";

//////////////////// INTERFACES ////////////////////

interface EnergyCost {
  type: string;
  amount?: number;
}

interface Move {
  cost: EnergyCost[];
  name: string;
  description: string;
  damage?: string;
  isGXAttack?: boolean;
  isVSTARAttack?: boolean;
}

interface Ability {
  type: "ability" | "poke-power" | "poke-body" | "vstar-power";
  name: string;
  description: string;
}

interface WeaknessResistance {
  type: string;
  modifier: string;
}

interface SetInfo {
  name: string;
  number: string;
  rarity: string;
  total_cards: string;
}

export interface PkmnCardDetails {
  // Core info
  card_type: "pokemon" | "trainer" | "energy";
  sub_types: string[];

  // Pokemon-specific
  hp?: number | string;
  type?: string;
  stage?: string;
  evolves_from?: string;
  evolves_into?: string;

  // Attacks & Abilities
  abilities: Ability[];
  attacks: Move[];

  // Weakness/Resistance/Retreat
  weakness?: WeaknessResistance;
  resistance?: WeaknessResistance;
  retreat_cost?: string;

  // Card text
  rules_text?: string;
  flavor_text?: string;
  special_rules?: string[];

  // Visuals
  image_url?: string;
  github_image_url?: string;

  // Set info
  set_info: SetInfo;

  // Creator
  illustrator: string;
}

interface AffiliateLink {
  site: string;
  url: string;
}

export interface pkmnEraAttributes {
  id: string;
  name: string;
  slug: string;
}

export interface pkmnSetAttributes {
  id: string;
  name: string;
  slug: string;
  setImg?: string;
  eraId: string;
  releaseDate: string;
  totalCards?: number;
  setCode?: string;
  tcgId: string;
}

export interface pkmnCardAttributes {
  id: string;
  name: string;
  slug: string;
  setId: string;
  details: PkmnCardDetails;
  affiliateLinks?: AffiliateLink[]; // Moved to top level
}

//////////////////// pkmnEra ////////////////////

export class pkmnEra
  extends Model<pkmnEraAttributes>
  implements pkmnEraAttributes
{
  public id!: string;
  public name!: string;
  public slug!: string;
}

pkmnEra.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "pkmnEra",
    tableName: "pkmnEras",
    timestamps: true,
  }
);

//////////////////// pkmnSet ////////////////////

export class pkmnSet
  extends Model<pkmnSetAttributes>
  implements pkmnSetAttributes
{
  public id!: string;
  public name!: string;
  public slug!: string;
  public setImg?: string;
  public eraId!: string;
  public releaseDate!: string;
  public totalCards?: number;
  public setCode?: string;
  public tcgId!: string;
}

pkmnSet.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    setImg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    eraId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: pkmnEra,
        key: "id",
      },
    },
    releaseDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalCards: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    setCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tcgId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TCG,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "pkmnSet",
    tableName: "pkmnSets",
    timestamps: true,
  }
);

//////////////////// pkmnCard ////////////////////

export class pkmnCard
  extends Model<pkmnCardAttributes>
  implements pkmnCardAttributes
{
  public id!: string;
  public name!: string;
  public slug!: string;
  public setId!: string;
  public details!: PkmnCardDetails;
  public affiliateLinks?: AffiliateLink[];
}

pkmnCard.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    setId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: pkmnSet,
        key: "id",
      },
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    affiliateLinks: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "pkmnCard",
    tableName: "pkmnCards",
    timestamps: true,
  }
);

//////////////////// RELATIONSHIPS ////////////////////

pkmnEra.hasMany(pkmnSet, { foreignKey: "eraId", as: "sets" });
pkmnSet.belongsTo(pkmnEra, { foreignKey: "eraId", as: "era" });

TCG.hasMany(pkmnSet, { foreignKey: "tcgId", as: "pokemonSets" });
pkmnSet.belongsTo(TCG, { foreignKey: "tcgId", as: "tcg" });

pkmnSet.hasMany(pkmnCard, { foreignKey: "setId", as: "cards" });
pkmnCard.belongsTo(pkmnSet, { foreignKey: "setId", as: "set" });

