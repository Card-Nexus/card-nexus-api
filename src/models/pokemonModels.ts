import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database'; 

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
    moves?: Move[];
    weakness?: string;
    resistance?: string;
    retreat?: string;
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
    setImg: string;
    eraId: string;
    releaseDate: string;
    totalCards: number;
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