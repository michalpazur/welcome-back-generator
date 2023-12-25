import { axios } from "../../util/axios";

type Page = {
  pageid: string;
  title: string;
  pageprops: {
    wikibase_item: string;
  };
};

type PageResponse = {
  query: {
    pages: {
      [k: string]: Page;
    };
  }
};

export const getWikiDataId = async (title: string) => {
  const response = (
    await axios.get<PageResponse>("https://en.wikipedia.org/w/api.php", {
      params: {
        action: "query",
        prop: "pageprops",
        titles: title,
        format: "json",
      },
    })
  ).data.query.pages;
  const key = Object.keys(response)[0];

  const page = response[key];
  if (page.pageprops) {
    return { title: page.title, id: page.pageprops.wikibase_item };
  }

  return undefined;
};
