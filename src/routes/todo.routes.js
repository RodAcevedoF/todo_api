/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The todo ID
 *         title:
 *           type: string
 *           description: The title of the todo
 *         description:
 *           type: string
 *           description: The description of the todo
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: The deadline for the todo
 *         fileUrl:
 *           type: string
 *           description: The URL of the attached file
 *       required:
 *         - title
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all todos for the authenticated user
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
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
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Todo created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the todo to update
 *     requestBody:
 *       required: true
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
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       404:
 *         description: Todo not found
 */

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the todo to delete
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 *       404:
 *         description: Todo not found
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
