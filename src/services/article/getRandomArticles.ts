import { axios } from "../../util/axios";

export type Article = {
  id: number;
  title: string;
};

type RandomArticleResponse = {
  query: {
    random: Article[];
  };
};

export const getRandomArticles = async (limit: number = 1) => {
  return (
    await axios.get<RandomArticleResponse>(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "query",
          list: "random",
          format: "json",
          rnlimit: limit > 1 ? (limit > 500 ? 500 : limit) : 1,
          rnnamespace: 0,
        },
      }
    )
  ).data.query.random;
};
