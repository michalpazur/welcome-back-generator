import crypto from "crypto";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import realine from "readline";
import { Entry, EntryAttributes } from "../models/entry";
import { Property } from "../models/properties";
import { getChildProperties } from "../services/properties/getChildProperties";
import {
  WikidataDate,
  getWikidataDetails,
} from "../services/wikidata/getWikiData";
import { getWikiDataId } from "../services/wikidata/getWikidataId";
import { rootProperties } from "../wikidataProperties";

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
  const children = await getChildProperties(rootId);
  const promises = children.map((c) => getChildProperties(c.id));
  const deepChildren = (await Promise.all(promises)).flatMap((arr) => arr);

  deepChildren.forEach((child) => {
    if (!children.find((a) => a.id === child.id)) {
      children.push(child);
      console.log(children.length);
    }
  });

  const toReturn = await Property.bulkCreate(
    children.map((c) => ({
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

const getWikidata = async (req: Request, res: Response) => {
  const stream = fs.createReadStream(path.join("python", "pageviews_f.csv"), {
    autoClose: true,
    start: 0,
  });

  const rl = realine.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const startDateKeys = await getKeys(rootProperties.startTime);
  const endDateKeys = await getKeys(rootProperties.endTime);
  const imageKeys = await getKeys(rootProperties.image);

  for await (const line of rl) {
    let title;
    try {
      title = JSON.parse(line.split(" ")[0]);
    } catch {
      title = line.split(" ")[0];
    }

    console.log(title);
    const response = await getWikiDataId(title);
    if (!response) continue;

    const id = response.id;
    const entry = await Entry.findByPk(id);
    if (entry || !id) continue;

    const wikidata = await getWikidataDetails(id);
    const newEntry: Partial<EntryAttributes> = { id, name: response.title };
    const imageKey = imageKeys.find((k) => !!wikidata[k]);
    if (!imageKey) continue;
    const image = (wikidata[imageKey][0].value);
    if (!image || !image.content) continue;
    const imageName = (wikidata[imageKey][0].value.content as string).replace(
      /\s/g,
      "_"
    );
    const hash = crypto.createHash("md5").update(imageName).digest("hex");
    const url = `${hash.substring(0, 1)}/${hash.substring(0, 2)}/${imageName}`;
    newEntry.imgUrl = "https://upload.wikimedia.org/wikipedia/commons/" + url;

    const startDateKey = startDateKeys.find((k) => !!wikidata[k]);
    if (!startDateKey) continue;
    const startDate = wikidata[startDateKey][0].value.content as WikidataDate;
    if (!startDate?.time) continue;
    let date = getDate(startDate.time);
    if (Number.isNaN(date.getTime())) continue;
    newEntry.startDate = date;
    newEntry.startPrecision = startDate.precision;

    const endDateKey = endDateKeys.find((k) => !!wikidata[k]);
    if (endDateKey) {
      const endDate = wikidata[endDateKey][0].value.content as WikidataDate;
      if (!endDate?.time) continue;
      let date = getDate(endDate.time);
      if (Number.isNaN(date.getTime())) continue;
      newEntry.endDate = date;
      newEntry.endPrecision = endDate.precision;
    }

    try {
      await Entry.create(newEntry as EntryAttributes);
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

export { router as adminRouter };
