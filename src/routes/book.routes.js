import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  createBook,
  getBooks,
  deleteBook,
  updateBook
} from "../controllers/book.controller.js";
import upload from "../config/upload.js";

const router = Router();

// Middleware para eliminar apiId en actualización (no se debe actualizar)
const excludeApiId = (req, res, next) => {
  if (req.body.apiId) delete req.body.apiId;
  next();
};

router.use(authenticate);

router.post(
  "/",
  upload.single("cover_image"),
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be text"),
    check("isbn").optional().isString().withMessage("ISBN must be text"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be text"),
    check("publisher")
      .optional()
      .isString()
      .withMessage("Publisher must be text"),
    check("publish_date")
      .optional()
      .isISO8601()
      .withMessage("Publish date must be valid"),
    check("pages")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("Pages number must be 0 or a positive number."),
    check("checked")
      .optional()
      .isBoolean()
      .withMessage("Field 'checked' must be boolean")
  ],
  createBook
);

router.get("/", getBooks);

router.delete("/:id", deleteBook);

router.patch(
  "/:id",
  upload.single("cover_image"),
  excludeApiId,
  [
    check("title").optional().isString().withMessage("Title must be text"),
    check("author").optional().isString().withMessage("Author must be text"),
    check("notes").optional().isString().withMessage("Notes must be text"),
    check("isbn").optional().isString().withMessage("ISBN must be text"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be text"),
    check("publisher")
      .optional()
      .isString()
      .withMessage("Publisher must be text"),
    check("publish_date")
      .optional()
      .isISO8601()
      .withMessage("Publish date must be valid"),
    check("pages")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("Pages number must be 0 or a positive number."),
    check("checked")
      .optional()
      .isBoolean()
      .withMessage("Field 'checked' must be boolean")
  ],
  updateBook
);

export default router;
/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the book
 *         author:
 *           type: string
 *           description: Author of the book
 *         notes:
 *           type: string
 *           description: Additional notes about the book
 *         isbn:
 *           type: string
 *           description: ISBN of the book
 *         description:
 *           type: string
 *           description: Description of the book
 *         publisher:
 *           type: string
 *           description: Publisher of the book
 *         publish_date:
 *           type: string
 *           format: date
 *           description: The publish date of the book
 *         pages:
 *           type: integer
 *           description: The number of pages in the book
 *         checked:
 *           type: boolean
 *           description: Whether the book has been checked or not
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Operations related to books
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the book
 *               author:
 *                 type: string
 *                 description: Author of the book
 *               notes:
 *                 type: string
 *                 description: Additional notes about the book
 *               isbn:
 *                 type: string
 *                 description: ISBN of the book
 *               description:
 *                 type: string
 *                 description: Description of the book
 *               publisher:
 *                 type: string
 *                 description: Publisher of the book
 *               publish_date:
 *                 type: string
 *                 description: Publish date of the book in ISO 8601 format
 *               pages:
 *                 type: integer
 *                 description: Number of pages in the book
 *               cover_image:
 *                 type: string
 *                 format: binary
 *                 description: Cover image of the book
 *               checked:
 *                 type: boolean
 *                 description: Whether the book is checked or not
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /books/{id}:
 *   patch:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the book
 *               author:
 *                 type: string
 *                 description: Author of the book
 *               notes:
 *                 type: string
 *                 description: Additional notes about the book
 *               isbn:
 *                 type: string
 *                 description: ISBN of the book
 *               description:
 *                 type: string
 *                 description: Description of the book
 *               publisher:
 *                 type: string
 *                 description: Publisher of the book
 *               publish_date:
 *                 type: string
 *                 description: Publish date of the book in ISO 8601 format
 *               pages:
 *                 type: integer
 *                 description: Number of pages in the book
 *               cover_image:
 *                 type: string
 *                 format: binary
 *                 description: Cover image of the book
 *               checked:
 *                 type: boolean
 *                 description: Whether the book is checked or not
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 */
