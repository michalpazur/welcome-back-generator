import { format } from "date-fns";
import express, { Request, Response } from "express";
import { Op } from "sequelize";
import { Entry } from "../models/entry";
import { sequelize } from "../util/sequelize";

type GenerateResponse = {
  died: string;
  diedDate: string;
  born: string;
  bornDate: string;
};

const findEntries = async () => {
  let died: Entry | null = null;
  let born: Entry | null = null;

  const allDead = await Entry.findAll({
    where: {
      endDate: {
        [Op.ne]: null,
      },
    },
  });

  while (!born) {
    const randomIndex = Math.floor(Math.random() * allDead.length);
    died = allDead[randomIndex] as Entry;
    const year = died.endDate?.getFullYear();
    born = await Entry.findOne({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date_part", "Year", sequelize.col("startDate")),
            year
          ),
          { id: { [Op.ne]: died.id } },
        ],
      },
    });
  }

  died = died as Entry;
  born = born as Entry;

  return { died, born };
};

const generateJson = async (req: Request, res: Response<GenerateResponse>) => {
  const { died, born } = await findEntries();

  res.json({
    died: died.name,
    diedDate: format(died.endDate as Date, "yyyy-MM-dd"),
    born: born.name,
    bornDate: format(born.startDate, "yyyy-MM-dd"),
  });
};

const router = express.Router();
router.get("/json", generateJson);

export { router as generateRouter };
