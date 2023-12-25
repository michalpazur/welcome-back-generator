import dotenv from "dotenv";
import express from "express";
import { adminRouter } from "./routes/admin";
import { randomRouter } from "./routes/random";
import { sequelize } from "./util/sequelize";

const app = express();
dotenv.config();

app.use("/admin", adminRouter);
app.use("/random", randomRouter);

const port = process.env.PORT || "3000";
app.listen(port, () => {
  sequelize.sync();
  console.log(`Wikipedia service ready on port ${port}!`);
});
