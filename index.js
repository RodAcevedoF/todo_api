import express from "express";
import cors from "cors";
import config from "./src/config/config.js";
import db from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import todoRoutes from "./src/routes/todo.routes.js";
import bookRoutes from "./src/routes/book.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import videoRoutes from "./src/routes/video.routes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";
import "./src/config/validateEnv.js"; // Validación de variables de entorno
import logger from "./src/config/logger.js"; // Logger personalizado
import compression from "compression"; // Middleware para compresión de respuestas
import helmet from "helmet"; // Middleware de seguridad HTTP
import {
  loginRateLimiter,
  registerRateLimiter
} from "./src/middlewares/rateLimit.js"; // Rate limiting

const app = express();
app.set("trust proxy", "loopback"); // Solo confía en proxies locales (127.0.0.1)

// CORS con orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:5174",
  "https://api-to-do.duckdns.org",
  "https://service.todo-api.site"
];

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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

// Middlewares globales
app.use(helmet()); // Seguridad HTTP
app.use(compression()); // Optimización
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de datos en el cuerpo de las solicitudes

// Carpeta de archivos estáticos (uploads)
app.use("/uploads", express.static(config.uploadDir));

// Logger de solicitudes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Conexión a la base de datos
db.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Connection error", err.stack));

// Documentación con Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check para monitorear el servidor
app.get("/ping", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});

// Rutas protegidas y funcionales
app.use("/api/auth/register", registerRateLimiter, authRoutes); // Registro con rate limit
app.use("/api/auth/login", loginRateLimiter, authRoutes); // Login con rate limit
app.use("/api/auth", authRoutes); // Todas las demás rutas de autenticación
app.use("/api/todos", todoRoutes); // Rutas de tareas
app.use("/api/books", bookRoutes); // Rutas de libros
app.use("/api/videos", videoRoutes); // Rutas de videos
app.use("/api/categories", categoryRoutes); // Rutas de categorías

// Manejo de errores en rutas inexistentes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Middleware para manejar errores globalmente
app.use(errorHandler);

// Iniciar el servidor
app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server running on port ${config.port}`);
});
