import express from "express";
import cors from "cors";
import config from "./src/config/config.js";
import db from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import verificationRoutes from "./src/routes/verification.routes.js";
import todoRoutes from "./src/routes/todo.routes.js";
import bookRoutes from "./src/routes/book.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import videoRoutes from "./src/routes/video.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
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
  "https://service.todo-api.site"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
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

// Conexión a la base de datos y manejo de errores
async function startServer() {
  try {
    await db.connect();
    console.log("PostgreSQL connected");
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error("Connection error", err.stack);
    process.exit(1); // Detener el servidor si no se puede conectar
  }
}

// Iniciar el servidor con conexión a la base de datos
startServer();

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
app.use("/api/auth", authRoutes); // login, logout, refresh
app.use("/api/user", userRoutes); // register, profile, credentials, image
app.use("/api/security", verificationRoutes); // email verify & password reset
app.use("/api/todos", todoRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Manejo de errores en rutas inexistentes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Middleware para manejar errores globalmente
app.use(errorHandler);
