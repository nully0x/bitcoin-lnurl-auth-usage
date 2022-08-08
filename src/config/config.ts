import dotenv from "dotenv";

dotenv.config();

//export config parameters
export const config = {
  host: process.env.host || "localhost",
  port: process.env.port || "3000",
  url: process.env.url || "http://localhost:3000",
  dialet: process.env.dialet,
  db: process.env.db,
  endpoint: process.env.ENDPOINT,
};
