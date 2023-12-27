import dotenv from "dotenv";
import express from "express";
import { adminRouter } from "./routes/admin";
import { generateRouter } from "./routes/generate";
import { iamgeRouter } from "./routes/image";
import { sequelize } from "./util/sequelize";

const app = express();
dotenv.config();

app.use("/admin", adminRouter);
app.use("/generate", generateRouter);
app.use("/image", iamgeRouter);

const port = process.env.PORT || "3000";
app.listen(port, () => {
  sequelize.sync({ alter: true });
  console.log(`Wikipedia service ready on port ${port}!`);
});
