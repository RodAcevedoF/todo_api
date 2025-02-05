/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Endpoints for managing todos
 *
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Todo data including an optional file and priority
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy groceries"
 *               description:
 *                 type: string
 *                 example: "Milk, Bread, Eggs"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "medium"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Todo created successfully
 *       400:
 *         description: Invalid input
 *
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Retrieve todos for the authenticated user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of todos to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of todos to skip
 *     responses:
 *       200:
 *         description: List of todos retrieved successfully
 *
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update an existing todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     requestBody:
 *       description: Fields to update (including optional file and priority)
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       404:
 *         description: Todo not found
 *
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 *       404:
 *         description: Todo not found
 *
 * @swagger
 * /api/todos/file/{filename}:
 *   get:
 *     summary: Retrieve a file associated with a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename of the uploaded file
 *     responses:
 *       200:
 *         description: File served successfully
 *       404:
 *         description: File not found
 */

import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { uploadMiddleware } from "../middlewares/upload.js";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  getFile
} from "../controllers/todo.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", uploadMiddleware, createTodo);
router.get("/", getTodos);
router.put("/:id", uploadMiddleware, updateTodo);
router.delete("/:id", deleteTodo);

router.get("/file/:filename", getFile);

export default router;
