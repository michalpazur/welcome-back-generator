import { Request, Response } from "express";
import {
  Article,
  getRandomArticles,
} from "../services/article/getRandomArticles";
import { getViews } from "../services/article/getViews";
import { E } from "../types";
import express from "express";

const randomRouter = express.Router();

type RandomArticleQuery = {
  minViews?: string;
};

type RandomArticle = {
  title: string;
  views: number;
};

const getRandomArticle = async (
  req: Request<E, E, E, RandomArticleQuery>,
  res: Response<RandomArticle>
) => {
  const { minViews } = req.query;
  const parsedViews = Number.parseInt(minViews || "");
  let articles: Article[];

  const checkForViews = !Number.isNaN(parsedViews) && parsedViews > 0;

  if (checkForViews) {
    articles = await getRandomArticles(500);
  } else {
    articles = await getRandomArticles();
  }

  for (let a in articles) {
    const article = articles[a];
    const viewsResponse = await getViews(article.title);
    if (
      (checkForViews && viewsResponse.views >= parsedViews) ||
      !checkForViews
    ) {
      return res.json({ title: article.title, views: viewsResponse.views });
    }
  }

  res.sendStatus(404);
};

randomRouter.get("/", getRandomArticle);

export { randomRouter };