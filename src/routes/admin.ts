import express, { Request, Response } from "express";
import { Property } from "../models/properties";
import { getChildProperties } from "../services/properties/getChildProperties";
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

export { router as adminRouter };
