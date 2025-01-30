/* import pg from "pg";
import config from "./config.js";

const { Pool } = pg;

const pool = new Pool(config.db);

export default {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect()
};
 */

import pg from "pg";
import config from "./config.js";

const { Pool } = pg;

let poolConfig;

if (config.db) {
  const dbUrl = new URL(config.db);
  poolConfig = {
    user: dbUrl.username,
    host: dbUrl.hostname,
    database: dbUrl.pathname.replace("/", ""),
    password: dbUrl.password,
    port: dbUrl.port || 5432,
    ssl: dbUrl.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : false,
  };
} else {
  throw new Error("DATABASE_URL is missing in the environment variables!");
}

const pool = new Pool(poolConfig);

export default {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect()
};
