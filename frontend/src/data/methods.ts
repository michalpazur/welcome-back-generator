export type Method = "sameYear" | "sameYearAfter" | "after" | "maxYearAfter";

export const methods: { key: Method; label: string }[] = [
  {
    key: "sameYearAfter",
    label: "Birth after death (the same year)",
  },
  { key: "sameYear", label: "Both dates in the same year" },
  { key: "maxYearAfter", label: "Birth after death (up to a year)" },
  { key: "after", label: "Birth any time after death" },
];
