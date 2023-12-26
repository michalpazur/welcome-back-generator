import dotenv from "dotenv";
import express from "express";
import { adminRouter } from "./routes/admin";
import { generateRouter } from "./routes/generate";
import { sequelize } from "./util/sequelize";

const app = express();
dotenv.config();

app.use("/admin", adminRouter);
app.use("/generate", generateRouter);

const port = process.env.PORT || "3000";
app.listen(port, () => {
  sequelize.sync();
  console.log(`Wikipedia service ready on port ${port}!`);
});
