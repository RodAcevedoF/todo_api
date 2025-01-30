import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  db: process.env.DATABASE_URL || "",
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES || "1d"
  },
  uploadDir: process.env.UPLOAD_DIR || "./uploads"
};

export default config;

/* db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  } */