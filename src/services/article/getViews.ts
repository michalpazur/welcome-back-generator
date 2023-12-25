import { endOfMonth, format, startOfMonth, sub } from "date-fns";
import { axios } from "../../util/axios";

type Views = {
  article: string;
  timestamp: string;
  views: number;
};

type ViewsResponse = {
  items: Views[];
};

export const getViews = async (title: string) => {
  const t = title.replace(/\s/g, "_");
  const today = new Date();
  const lastMonthStart = startOfMonth(sub(today, { months: 1 }));
  const lastMonthEnd = endOfMonth(lastMonthStart);

  return (
    await axios.get<ViewsResponse>(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/user/${t}/monthly/${format(
        lastMonthStart,
        "yyyyMMdd"
      )}/${format(lastMonthEnd, "yyyyMMdd")}`
    )
  ).data.items[0];
};
