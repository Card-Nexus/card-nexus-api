import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface APIKeyAttributes {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  usageType: string;
}

export class APIKey
  extends Model<APIKeyAttributes>
  implements APIKeyAttributes
{
  public id!: string;
  public key!: string;
  public name!: string;
  public isActive!: boolean;
  public usageType!: string;
}

APIKey.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    key: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    usageType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "APIKey",
    tableName: "apiKeys",
    timestamps: true,
  }
);

export default APIKey;
