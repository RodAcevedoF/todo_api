import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import config from "./src/config/config.js";
import db from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import todoRoutes from "./src/routes/todo.routes.js";
import bookRoutes from "./src/routes/book.routes.js";
import videoRoutes from "./src/routes/video.routes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";
import "./src/config/validateEnv.js";
import logger from "./src/config/logger.js";
import compression from "compression";
import helmet from "helmet";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://api-to-do.duckdns.org" 
];

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get('/ping', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Middlewares
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS bloqueado para: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(config.uploadDir));

// Logger de solicitudes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Conexión a DDBB
db.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Connection error", err.stack));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Non-existent routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.use(errorHandler);

app.listen(config.port, "0.0.0.0", () =>
  console.log(`Server running on port ${config.port}`)
);
