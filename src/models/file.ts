import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../util/sequelize";
import { Entry } from "./entry";

interface FileAttributes {
  fileName: string;
  diedId: string;
  bornId: string;
  deleteAt: Date;
}

export class File
  extends Model<InferAttributes<File>, InferCreationAttributes<File>>
  implements FileAttributes
{
  declare id: CreationOptional<number>;
  declare fileName: string;
  declare diedId: ForeignKey<Entry["id"]>;
  declare bornId: ForeignKey<Entry["id"]>;
  declare deleteAt: Date;
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
    },
    diedId: {
      type: DataTypes.STRING,
    },
    bornId: {
      type: DataTypes.STRING,
    },
    deleteAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
  }
);

Entry.hasMany(File, { foreignKey: "diedId" });
Entry.hasMany(File, { foreignKey: "bornId" });
File.belongsTo(Entry, { foreignKey: "diedId" });
File.belongsTo(Entry, { foreignKey: "bornId" });
