/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Endpoints for managing books
 *
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book entry
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               apiId:
 *                 type: string
 *                 example: "123456"
 *               title:
 *                 type: string
 *                 example: "Example Book"
 *               author:
 *                 type: string
 *                 example: "Author Name"
 *               notes:
 *                 type: string
 *                 example: "Some notes about the book"
 *               cover_image:
 *                 type: string
 *                 example: "http://example.com/cover.jpg"
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input
 *
 * /api/books:
 *   get:
 *     summary: Get the list of books for the authenticated user
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of books to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of books to skip
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
 *
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book entry
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *
 * /api/books/{id}:
 *   put:
 *     summary: Update a book entry
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiId:
 *                 type: string
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               notes:
 *                 type: string
 *               cover_image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 */

import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  createBook,
  getBooks,
  deleteBook,
  updateBook
} from "../controllers/book.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
    check("cover_image").optional().isString().withMessage("Cover image must be a string")
  ],
  createBook
);

router.get("/", getBooks);

router.delete("/:id", deleteBook);

router.put(
  "/:id",
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
    check("cover_image").optional().isString().withMessage("Cover image must be a string")
  ],
  updateBook
);

export default router;
