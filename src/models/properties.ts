import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../util/sequelize";

interface PropertyAttributes {
  id: string;
  parentId: string;
  name: string;
}

export class Property
  extends Model<InferAttributes<Property>, InferCreationAttributes<Property>>
  implements PropertyAttributes
{
  declare id: string;
  declare parentId: string;
  declare name: string;
}

Property.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    parentId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
  }
);
