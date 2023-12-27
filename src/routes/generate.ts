import {
  CanvasRenderingContext2D,
  Image,
  createCanvas,
  loadImage,
} from "canvas";
import crypto from "crypto";
import { add, format } from "date-fns";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Op, WhereOptions } from "sequelize";
import { Entry, EntryAttributes } from "../models/entry";
import { File } from "../models/file";
import { E, MessageResponse } from "../types";
import { userAgent } from "../util/axios";
import { sequelize } from "../util/sequelize";

type DateQuery = "sameYear" | "sameYearAfter" | "after" | "maxYearAfter";
type GenerateQuery = { method: DateQuery };

const findEntries = async (query: DateQuery = "sameYear") => {
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
    let randomIndex = Math.floor(Math.random() * allDead.length);
    died = allDead[randomIndex] as Entry;
    const diedDate = died.endDate as Date;

    const sameYearFilter = sequelize.where(
      sequelize.fn("date_part", "Year", sequelize.col("startDate")),
      diedDate.getFullYear()
    );
    const dateGreaterFilter = { startDate: { [Op.gte]: diedDate } };

    const dateFilter: { [k in DateQuery]: WhereOptions<EntryAttributes> } = {
      sameYear: sameYearFilter,
      sameYearAfter: [sameYearFilter, dateGreaterFilter],
      after: dateGreaterFilter,
      maxYearAfter: [
        dateGreaterFilter,
        { startDate: { [Op.lte]: add(diedDate, { years: 1 }) } },
      ],
    };

    const allBorn = await Entry.findAll({
      where: {
        [Op.and]: [
          dateFilter[query] || dateFilter.sameYear,
          { id: { [Op.ne]: died.id } },
        ],
      },
    });
    randomIndex = Math.floor(Math.random() * allBorn.length);
    born = allBorn[randomIndex];
  }

  died = died as Entry;
  born = born as Entry;

  return { died, born };
};

type GenerateJsonResponse = {
  died: string;
  diedDate: string;
  born: string;
  bornDate: string;
};

const generateJson = async (
  req: Request<E, E, E, GenerateQuery>,
  res: Response<GenerateJsonResponse>
) => {
  const { method } = req.query;
  const { died, born } = await findEntries(method);

  res.json({
    died: died.name,
    diedDate: format(died.endDate as Date, "yyyy-MM-dd"),
    born: born.name,
    bornDate: format(born.startDate, "yyyy-MM-dd"),
  });
};

const width = 1200;
const height = 1000;

const textFieldHeight = 120;
const padding = 20;
const topTextWidth = width / 2 - padding * 2;

const imageHeight = height - textFieldHeight * 2;
const imageWidth = width / 2;

const pasteImage = (img: Image, ctx: CanvasRenderingContext2D, x: number) => {
  if (img.width / img.height > 3 / 2) {
    const ratio = imageWidth / img.width;
    const targetHeight = img.height * ratio;
    const dy = (imageHeight - targetHeight) / 2;
    ctx.drawImage(img, x, textFieldHeight + dy, imageWidth, targetHeight);
    return;
  }

  if (img.width / img.height < 3 / 5) {
    const ratio = imageHeight / img.height;
    const targetWidth = img.width * ratio;
    const dx = (imageWidth - targetWidth) / 2;
    ctx.drawImage(img, x + dx, textFieldHeight, targetWidth, imageHeight);
    return;
  }

  if (imageWidth / imageHeight < img.width / img.height) {
    const srcWidth = (img.height * imageWidth) / imageHeight;
    ctx.drawImage(
      img,
      (img.width - srcWidth) / 2,
      0,
      srcWidth,
      img.height,
      x,
      textFieldHeight,
      imageWidth,
      imageHeight
    );
  } else {
    const srcHeight = (img.width * imageHeight) / imageWidth;
    ctx.drawImage(
      img,
      0,
      (img.height - srcHeight) / 2,
      img.width,
      srcHeight,
      x,
      textFieldHeight,
      imageWidth,
      imageHeight
    );
  }
};

const getFileName = (diedId: string, bornId: string) => {
  const hash = crypto.createHash("sha256").update(`${diedId}:${bornId}`);
  return hash.digest("base64url") + ".png";
};

type GenerateResponse = GenerateJsonResponse & {
  diedUrl: string;
  bornUrl: string;
  fileName: string;
};

const makeResponse = (died: Entry, born: Entry, fileName: string) => ({
  died: died.name,
  diedDate: format(died.endDate as Date, "yyy-MM-dd"),
  diedUrl: `https://en.wikipedia.org/wiki/${died.name.replace(/\s/g, "_")}`,
  born: born.name,
  bornDate: format(born.startDate, "yyy-MM-dd"),
  bornUrl: `https://en.wikipedia.org/wiki/${born.name.replace(/\s/g, "_")}`,
  fileName,
});

const fileTTL = 1000 * 60 * 60 * 3; // 3h

const generate = async (
  req: Request<E, E, E, GenerateQuery>,
  res: Response<GenerateResponse | MessageResponse>
) => {
  const { method } = req.query;
  const { died, born } = await findEntries(method);

  const fileName = getFileName(died.id, born.id);
  const file = await File.findOne({ where: { fileName } });

  if (file) {
    return res.json(makeResponse(died, born, fileName));
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#757575";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "bold 72px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#FFFFFF";

  const diedDate = died.endDate as Date;
  const bornDate = born.startDate as Date;
  const showDate = method === "maxYearAfter" || method === "sameYearAfter";

  const dateFormat = !showDate ? "yyyy" : "yyyy/MM/dd";
  ctx.fillText(
    `Died ${!showDate ? "in" : "on"} ${format(diedDate, dateFormat)}`,
    width / 4,
    textFieldHeight / 2,
    topTextWidth
  );

  const bottomTextY = height - textFieldHeight / 2;
  ctx.fillText(
    `Welcome back ${died.name}`,
    width / 2,
    bottomTextY,
    width - padding * 2
  );

  ctx.font = "bold 55px Arial";
  ctx.fillText(born.name, (3 * width) / 4, textFieldHeight / 4, topTextWidth);
  ctx.fillText(
    `Born ${!showDate ? "in" : "on"} ${format(bornDate, dateFormat)}`,
    (3 * width) / 4,
    (3 * textFieldHeight) / 4,
    topTextWidth
  );

  try {
    const diedImg = await loadImage(encodeURI(died.imgUrl), { userAgent });
    const bornImg = await loadImage(encodeURI(born.imgUrl), { userAgent });
    pasteImage(diedImg, ctx, 0);
    pasteImage(bornImg, ctx, width / 2);
  } catch (e: any) {
    return res.json({ message: e });
  }

  await File.create({
    diedId: died.id,
    bornId: born.id,
    fileName,
    deleteAt: new Date(new Date().getTime() + fileTTL),
  });

  const fileStream = fs.createWriteStream(`storage/${fileName}`, {
    flags: "w",
  });
  const canvasStream = canvas.createPNGStream({ compressionLevel: 8 });
  canvasStream.pipe(fileStream);

  fileStream.on("close", () => {
    if (!res.headersSent) {
      res.json(makeResponse(died, born, fileName));
    }
  });

  fileStream.on("error", (e) => {
    res.json({ message: e.message });
  });
};

const getFile = (req: Request<{ fileName: string }>, res: Response) => {
  const { fileName } = req.params;
  const fileExists = fs.existsSync(path.join("storage", fileName));
  if (fileExists) {
    res.sendFile(fileName, { root: "storage" });
  } else {
    res.sendStatus(404);
  }
};

const router = express.Router();
router.get("/json", generateJson);
router.get("/", generate);
router.get("/image/:fileName", getFile);

export { router as generateRouter };
