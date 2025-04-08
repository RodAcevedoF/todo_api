import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES || "1h", // Access token con expiración corta
    refreshSecret: process.env.JWT_REFRESH_SECRET, // Secreto para refresh tokens
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" // Expiración de refresh tokens
  },
  uploadDir: process.env.UPLOAD_DIR || "./uploads"
};

export default config;
