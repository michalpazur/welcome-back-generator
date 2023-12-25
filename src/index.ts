import express from "express";
import { randomRouter } from "./routes/random";

const app = express();

app.use("/random", randomRouter);

app.listen(3000, () => {
  console.log("Wikipedia service ready!");
});
