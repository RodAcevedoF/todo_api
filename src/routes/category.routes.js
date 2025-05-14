import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  createCategory,
  getCategories,
  addCategoriesToBook
} from "../controllers/category.controller.js";

const router = Router();

router.use(authenticate);

// Ruta para crear una categoría
router.post(
  "/",
  [check("name").notEmpty().withMessage("Category name is required")],
  createCategory
);

// Ruta para obtener todas las categorías
router.get("/", getCategories);

// Ruta para asociar categorías con un libro
router.post(
  "/books/:bookId",
  [check("categories").isArray().withMessage("Categories must be an array")],
  addCategoriesToBook
);

export default router;
