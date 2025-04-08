import dotenv from "dotenv";

// Cargar las variables de entorno desde .env
dotenv.config();

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET", // Agregamos el secreto del refresh token
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "PORT",
  "NODE_ENV"
];

// Validar que todas las variables requeridas estén configuradas
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
});

// Validar el valor de NODE_ENV
if (!["development", "production", "test"].includes(process.env.NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV value: ${process.env.NODE_ENV}`);
}

console.log("Environment variables successfully validated.");
