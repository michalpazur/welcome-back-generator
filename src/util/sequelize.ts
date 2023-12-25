import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  NODE_ENV,
} = process.env;

const sequelize = new Sequelize({
  dialect: "postgres",
  host: POSTGRES_HOST || "db",
  port: 5432,
  username: POSTGRES_USER || "postgres",
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  logging: NODE_ENV !== "production",
});

export { sequelize };
