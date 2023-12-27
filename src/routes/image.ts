import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

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
router.get("/:fileName", getFile);

export { router as iamgeRouter };
