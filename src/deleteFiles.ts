import { Op } from "sequelize";
import { File } from "./models/file";

const main = async () => {
  const filesToDelete = await File.destroy({
    where: {
      deleteAt: {
        [Op.lte]: new Date(),
      },
    },
    individualHooks: true,
  });

  return filesToDelete;
};

main().then((deltedRecords: number) => {
  console.log(`Deleted ${deltedRecords} records!`);
  process.exit(0);
});
