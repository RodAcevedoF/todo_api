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
/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the category
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Operations related to categories
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /categories/books/{bookId}:
 *   post:
 *     summary: Add categories to a book
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         description: The ID of the book to associate categories with
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 description: List of category IDs to associate with the book
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Categories added to the book successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 */
