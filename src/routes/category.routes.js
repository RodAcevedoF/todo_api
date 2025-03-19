import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import { createCategory, getCategories, addCategoriesToBook } from "../controllers/category.controller.js";

const router = Router();

router.use(authenticate);

// Ruta para crear una categoría
router.post(
  "/",
  [check("name").notEmpty().withMessage("El nombre de la categoría es obligatorio")],
  createCategory
);

// Ruta para obtener todas las categorías
router.get("/", getCategories);

// Ruta para asociar categorías con un libro
router.post(
  "/books/:bookId",
  [check("categories").isArray().withMessage("Debes proporcionar un arreglo de categorías")],
  addCategoriesToBook
);

export default router;
