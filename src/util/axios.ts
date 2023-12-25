import axios from "axios";

const instance = axios.create({
  headers: {
    "User-Agent": "michal.pazur1@gmail.com",
  },
});

export { instance as axios };
