import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const userAgent = `axios/1.6.2 ${process.env.USER_AGENT_EMAIL}`;

const instance = axios.create({
  headers: {
    "User-Agent": userAgent,
  },
});

export { instance as axios };
