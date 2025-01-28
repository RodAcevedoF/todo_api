/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The book ID
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         notes:
 *           type: string
 *           description: Notes about the book
 *       required:
 *         - title
 *         - author
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books for the authenticated user
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
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the book to delete
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */


import { Router } from 'express';
import { check } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { createBook, getBooks, deleteBook } from '../controllers/book.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    check('title').notEmpty().withMessage('Title is required'),
    check('author').notEmpty().withMessage('Author is required'),
    check('notes').optional().isString().withMessage('Notes must be a string')
  ],
  createBook
);

router.get('/', getBooks);

router.delete('/:id', deleteBook);

export default router;
