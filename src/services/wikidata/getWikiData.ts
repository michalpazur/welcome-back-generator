import { axios } from "../../util/axios";

export type WikidataDate = {
  time: string;
  precision: number;
};

type WikidataResponse = {
  statements: {
    [k: string]: {
      value:
        | {
            content: string;
          }
        | {
            content: WikidataDate;
          };
    }[];
  };
};

export const getWikidataDetails = async (id: string) => {
  const response = (
    await axios.get<WikidataResponse>(
      "https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/" + id
    )
  ).data.statements;

  return response;
};
