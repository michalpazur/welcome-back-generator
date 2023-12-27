import {
  CanvasRenderingContext2D,
  Image,
  createCanvas,
  loadImage,
} from "canvas";
import { format } from "date-fns";
import express, { Request, Response } from "express";
import { Op } from "sequelize";
import { Entry } from "../models/entry";
import { userAgent } from "../util/axios";
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
    let randomIndex = Math.floor(Math.random() * allDead.length);
    died = allDead[randomIndex] as Entry;
    const year = died.endDate?.getFullYear();

    const allBorn = await Entry.findAll({
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
    randomIndex = Math.floor(Math.random() * allBorn.length);
    born = allBorn[randomIndex];
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

const generate = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "image/png");
  const { died, born } = await findEntries();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#757575";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "bold 72px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#FFFFFF";

  const endYear = died.endDate?.getFullYear() as number;

  ctx.fillText(
    `Died in ${endYear}`,
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
    `Born in ${born.startDate.getFullYear()}`,
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
    console.log(e);
  }

  canvas.toBuffer(
    (err, buf) => {
      res.send(buf);
    },
    "image/png",
    { compressionLevel: 7 }
  );
};

const router = express.Router();
router.get("/json", generateJson);
router.get("/", generate);

export { router as generateRouter };
