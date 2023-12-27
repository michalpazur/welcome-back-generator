import crypto from "crypto";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import realine from "readline";
import { Op } from "sequelize";
import { Entry, EntryAttributes } from "../models/entry";
import { Property } from "../models/properties";
import { getChildProperties } from "../services/properties/getChildProperties";
import {
  WikidataDate,
  getWikidataDetails,
} from "../services/wikidata/getWikiData";
import { getWikiDataId } from "../services/wikidata/getWikidataId";
import { propertiesBlacklist, rootProperties } from "../wikidataProperties";

const router = express.Router();

type WikiPropertiesResponse = {
  [k in keyof typeof rootProperties]: {
    time: string;
    numProperties: number;
  };
};

const getDeltaTime = (startTime: number) =>
  ((Date.now() - startTime) / 1000).toFixed(2);

const getChildren = async (rootId: string) => {
  await Property.destroy({
    where: {
      [Op.and]: {
        parentId: rootId,
        id: {
          [Op.ne]: rootId,
        },
      },
    },
  });

  const children = await getChildProperties(rootId);
  const promises = children.map((c) => getChildProperties(c.id));
  const deepChildren = (await Promise.all(promises)).flatMap((arr) => arr);

  deepChildren.forEach((child) => {
    if (!children.find((a) => a.id === child.id)) {
      children.push(child);
    }
  });

  const toReturn = await Property.bulkCreate(
    children
      .filter((c) => !propertiesBlacklist.includes(c.id))
      .map((c) => ({
        ...c,
        parentId: rootId,
      })),
    { ignoreDuplicates: true }
  );
  return toReturn;
};

const rebuildWikiProperties = async (
  req: Request,
  res: Response<WikiPropertiesResponse>
) => {
  const response: Partial<WikiPropertiesResponse> = {};

  for (let k in rootProperties) {
    const key = k as keyof typeof rootProperties;
    const id = rootProperties[key];
    const startDate = await Property.findByPk(id);
    if (!startDate) {
      Property.create({
        id,
        parentId: id,
        name: key,
      });
    }

    let startTime = Date.now();
    let created = await getChildren(id);

    const partResponse = {
      time: getDeltaTime(startTime),
      numProperties: created.length,
    };

    response[key] = partResponse;
  }

  res.json(response as WikiPropertiesResponse);
};

router.post("/rebuildProperties", rebuildWikiProperties);

const getKeys = async (parentId: string) =>
  (await Property.findAll({ where: { parentId } })).map((p) => p.id);

type Keys = {
  imageKeys: string[];
  startDateKeys: string[];
  endDateKeys: string[];
};

const getKeysObject = async () => {
  const startDateKeys = await getKeys(rootProperties.startTime);
  const endDateKeys = await getKeys(rootProperties.endTime);
  const imageKeys = await getKeys(rootProperties.image);

  const keys: Keys = {
    imageKeys,
    startDateKeys,
    endDateKeys,
  };

  return keys;
};

const getDate = (dateStr: string) => {
  const sign = dateStr[0];
  const dateSegments = dateStr
    .substring(1)
    .split("-")
    .map((s) => Number.parseInt(s));
  const date = new Date(0);
  date.setFullYear(sign === "-" ? -dateSegments[0] : dateSegments[0]);
  date.setMonth(dateSegments[1] > 0 ? dateSegments[1] - 1 : 0);
  date.setDate(dateSegments[2] > 0 ? dateSegments[2] : 1);
  return date;
};

const getWikidataForObject = async (
  title: string,
  keys: Keys,
  skipCheck?: boolean
) => {
  const { imageKeys, startDateKeys, endDateKeys } = keys;

  const response = await getWikiDataId(title);
  if (!response) return undefined;

  const id = response.id;
  const entry = await Entry.findByPk(id);
  if ((entry && !skipCheck) || !id) return undefined;

  const wikidata = await getWikidataDetails(id);
  const newEntry: Partial<EntryAttributes> = { id, name: response.title };
  const imageKey = Object.keys(wikidata).find((k) => imageKeys.includes(k));
  if (!imageKey) return undefined;
  const image = wikidata[imageKey][0].value;
  if (!image || !image.content) return undefined;

  const imgUrl = wikidata[imageKey][0].value.content as string;
  if (imgUrl.startsWith("http")) {
    newEntry.imgUrl = imgUrl;
  } else {
    const imageName = imgUrl.replace(/\s/g, "_");
    const hash = crypto.createHash("md5").update(imageName).digest("hex");
    const url = `${hash.substring(0, 1)}/${hash.substring(
      0,
      2
    )}/${imageName}/600px-${imageName}.png`;
    newEntry.imgUrl =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/" + url;
  }

  const startDateKey = Object.keys(wikidata).find((k) => startDateKeys.includes(k));
  if (!startDateKey) return undefined;
  const startDate = wikidata[startDateKey][0].value.content as WikidataDate;
  if (!startDate?.time) return undefined;
  let date = getDate(startDate.time);
  if (Number.isNaN(date.getTime())) return undefined;
  newEntry.startDate = date;
  newEntry.startPrecision = startDate.precision;

  const endDateKey = Object.keys(wikidata).find((k) => endDateKeys.includes(k));
  if (endDateKey) {
    const endDate = wikidata[endDateKey][0].value.content as WikidataDate;
    if (!endDate?.time) return undefined;
    let date = getDate(endDate.time);
    if (Number.isNaN(date.getTime())) return undefined;
    newEntry.endDate = date;
    newEntry.endPrecision = endDate.precision;
  }

  return newEntry as EntryAttributes;
};

const getWikidata = async (req: Request, res: Response) => {
  const stream = fs.createReadStream(path.join("python", "pageviews_f.csv"), {
    autoClose: true,
    start: 0,
  });

  const keys = await getKeysObject();

  const rl = realine.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    let title;
    try {
      title = JSON.parse(line.split(" ")[0]);
    } catch {
      title = line.split(" ")[0];
    }

    const newEntry = await getWikidataForObject(title, keys);

    if (!newEntry) continue;

    try {
      await Entry.create(newEntry);
    } catch {
      // pass
    }
  }

  if (!stream.closed) {
    stream.close();
  }

  res.sendStatus(200);
};

router.post("/getWikidata", getWikidata);

const updateWikidata = async (req: Request, res: Response) => {
  const keys = await getKeysObject();
  const toDelete: string[] = [];
  const count = await Entry.count();

  for (let i = 0; i < count; i += 100) {
    const entries = await Entry.findAll({ limit: 100, offset: i });
    for (let entry of entries) {
      console.log(entry.name);
      const title = entry.name.replace(/\s/g, "_");
      const newEntry = await getWikidataForObject(title, keys, true);
      if (newEntry) {
        await entry.update({
          ...newEntry,
          endDate: newEntry.endDate ? newEntry.endDate : null,
          endPrecision: newEntry.endPrecision ? newEntry.endPrecision : null,
        });
      } else {
        toDelete.push(entry.id);
      }
    }
  }

  await Entry.destroy({ where: { id: toDelete } });
  res.sendStatus(200);
};

router.post("/updateSavedWikidata", updateWikidata);

export { router as adminRouter };
