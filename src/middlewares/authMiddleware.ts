import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

dotenv.config();

const { ADMIN_LOGIN, ADMIN_PASSWORD } = process.env;

const bytes = new TextEncoder().encode(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}`);
const base64Auth = btoa(String.fromCodePoint(...bytes));

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.get("Authorization");

  if (!auth || auth.split(" ")[1] !== base64Auth) {
    return res.sendStatus(401);
  }

  next();
};
