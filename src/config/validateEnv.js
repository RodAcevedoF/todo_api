import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "PORT",
  "NODE_ENV"
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
});

if (!["development", "production", "test"].includes(process.env.NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV value: ${process.env.NODE_ENV}`);
}

console.log("Environment variables successfully validated.");
