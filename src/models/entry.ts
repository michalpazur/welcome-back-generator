import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../util/sequelize";

export interface EntryAttributes {
  id: string;
  name: string;
  startDate: Date;
  startPrecision: number;
  endDate?: Date;
  endPrecision?: number;
  imgUrl: string;
}

export class Entry
  extends Model<InferAttributes<Entry>, InferCreationAttributes<Entry>>
  implements EntryAttributes
{
  declare id: string;
  declare name: string;
  declare startDate: Date;
  declare startPrecision: number;
  declare endDate?: Date | undefined;
  declare endPrecision?: number | undefined;
  declare imgUrl: string;
}

Entry.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    startPrecision: {
      type: DataTypes.INTEGER,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endPrecision: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    imgUrl: {
      type: DataTypes.STRING,
    },
  },
  { sequelize }
);
