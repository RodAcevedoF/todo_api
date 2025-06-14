import app from "./src/app.js";
import db from "./src/config/db.js";
import config from "./src/config/config.js";

async function startServer() {
  try {
    await db.connect();
    console.log("PostgreSQL connected");

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error("Connection error", err.stack);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
