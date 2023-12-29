import dotenv from "dotenv";
import express from "express";
import { authMiddleware } from "./middlewares/authMiddleware";
import { adminRouter } from "./routes/admin";
import { generateRouter } from "./routes/generate";
import { imageRouter } from "./routes/image";
import { rateLimiter } from "./util/rateLimiter";
import { sequelize } from "./util/sequelize";
import { errorLogger, expressLogger, logger } from "./util/logger";

const app = express();
dotenv.config();

app.set("trust proxy", Number.parseInt(process.env.TRUSTED_PROXIES || "1"));

app.use(expressLogger);
app.use("/admin", rateLimiter, authMiddleware, adminRouter);
app.use("/generate", rateLimiter, generateRouter);
app.use("/image", imageRouter);

app.get("/ip", (req, res) =>
  res.json({ ip: req.ip, forwaredFor: req.get("X-Forwarded-For") })
);

app.use(errorLogger);
const port = process.env.PORT || "3000";

app.listen(port, () => {
  sequelize.sync({ alter: true });
  console.log(`Wikipedia service ready on port ${port}!`);
});
