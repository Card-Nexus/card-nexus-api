import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database'; 

export interface TCGAttributes {
    id: string;
    name: string;
    slug: string;
    img?: string;
}

export class TCG extends Model<TCGAttributes> implements TCGAttributes {
    public id!: string;
    public name!: string;
    public slug!: string;
    public img?: string;
}

TCG.init(
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
      img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'TCG',
      tableName: 'tcgs',
      timestamps: true,
    }
  );
  
  export default TCG;