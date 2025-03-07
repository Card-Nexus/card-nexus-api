import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database'; 
import TCG from './tcgModels';

//////////////////// INTERFACES ////////////////////

interface Move {
    cost: string[];
    name: string;
    damage?: number;
    effect?: string;
}

interface Ability {
    name: string;
    effect: string;
}

interface SpecialRule {
    type: string;
    rules: string;
}

interface AffiliateLink {
    site: string;
    url: string;
}

interface PkmnCardDetails {
    hp?: string;
    type?: string;
    cardType: string;
    setNumber: string;
    moves?: Move[];
    weakness?: string;
    resistance?: string;
    retreat?: number;
    illustrated: string;
    rarity: string;
    flavorText?: string;
    affiliateLinks?: AffiliateLink[];
    stage?: string;
    evolvesFrom?: string;
    img?: string;
    ability?: Ability;
    special?: SpecialRule;
    rules?: string;
    cardEffect: string;
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
    setCode: string;
    tcgId: string;
}

export interface pkmnCardAttributes {
    id: string;
    name: string;
    slug: string;
    setId: string;
    details: PkmnCardDetails;
}

//////////////////// pkmnEra ////////////////////

export class pkmnEra extends Model<pkmnEraAttributes> implements pkmnEraAttributes {
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
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'pkmnEra',
        tableName: 'pkmnEras',
        timestamps: true
    }
)

//////////////////// pkmnSet ////////////////////

export class pkmnSet extends Model<pkmnSetAttributes> implements pkmnSetAttributes {
    public id!: string;
    public name!: string;
    public slug!: string;
    public setImg?: string;
    public eraId!: string;
    public releaseDate!: string;
    public totalCards?: number;
    public setCode!: string;
    public tcgId!: string;
}

pkmnSet.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    setImg: {
        type: DataTypes.STRING,
        allowNull: true
    },
    eraId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: pkmnEra,
            key: "id",
        }
    },
    releaseDate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalCards: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    setCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tcgId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: TCG,
            key: "id"
        }
    }
}, {
    sequelize,
    modelName: "pkmnSet",
    tableName: "pkmnSets",
    timestamps: true
})

//////////////////// pkmnCard ////////////////////

export class pkmnCard extends Model<pkmnCardAttributes> implements pkmnCardAttributes {
    public id!: string;
    public name!: string;
    public slug!: string;
    public setId!: string;
    public details!: PkmnCardDetails;
}

pkmnCard.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
            key: "id"
        }
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: false,
    }
},{
    sequelize,
    modelName: 'pkmnCard',
    tableName: 'pkmnCards',
    timestamps: true
})

//////////////////// RELATIONSHIPS ////////////////////

pkmnEra.hasMany(pkmnSet, {foreignKey: "eraId", as: 'sets'})
pkmnSet.belongsTo(pkmnEra, {foreignKey: "eraId", as: 'era'})

TCG.hasMany(pkmnSet, {foreignKey: "tcgId", as: 'pokemonSets'})
pkmnSet.belongsTo(TCG, {foreignKey: "tcgId", as: 'tcg'})

pkmnSet.hasMany(pkmnCard, { foreignKey: "setId", as: 'cards' });
pkmnCard.belongsTo(pkmnSet, { foreignKey: "setId", as: 'set' });