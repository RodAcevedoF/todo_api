import express from "express";
import cors from "cors";
import config from "./config/config.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import bookRoutes from "./routes/book.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import videoRoutes from "./routes/video.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import "./config/validateEnv.js";
import logger from "./config/logger.js";
import compression from "compression";
import helmet from "helmet";
import basicAuth from "express-basic-auth";

const app = express();
app.set("trust proxy", "loopback");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:5174",
  "https://service.todo-api.site",
  "https://getdoneapp.vercel.app"
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
    credentials: false,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(config.uploadDir));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(
  "/api-docs",
  basicAuth({
    users: { admin: process.env.SWAGGER_PASSWORD },
    challenge: true
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/ping", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/security", verificationRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.use(errorHandler);

export default app;
