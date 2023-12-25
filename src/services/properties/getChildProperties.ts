import { axios } from "../../util/axios";

type Prop = {
  subProperties: {
    value: string;
  };
  subPropertiesLabel: {
    value: string;
  };
};

type PropResponse = {
  results: {
    bindings: Prop[];
  };
};

export const getChildProperties = async (rootProp: string) => {
  const query = `SELECT DISTINCT ?subProperties ?subPropertiesLabel WHERE {
    ?subProperties wdt:P1647* wd:${rootProp}.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  const response = (
    await axios.get<PropResponse>("https://query.wikidata.org/sparql", {
      params: { query },
    })
  ).data.results.bindings;
  const props = response
    .map((p) => {
      const splitUrl = p.subProperties.value.split("/");
      const id = splitUrl[splitUrl.length - 1];
      return {
        id,
        name: p.subPropertiesLabel.value,
      };
    })
    .filter((p) => p.id.startsWith("P"));

  return props;
};
