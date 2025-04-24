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
/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the to-do item
 *         description:
 *           type: string
 *           description: Description of the to-do item
 *         checked:
 *           type: boolean
 *           description: Whether the to-do item is checked or not
 *         file:
 *           type: string
 *           format: binary
 *           description: File related to the to-do item (if any)
 */

/**
 * @swagger
 * tags:
 *   name: To-do
 *   description: To-do management operations
 */

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new to-do
 *     tags: [To-do]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       201:
 *         description: To-do item created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized, invalid token
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all to-do items
 *     tags: [To-do]
 *     responses:
 *       200:
 *         description: List of to-do items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized, invalid token
 */

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a to-do item by ID
 *     tags: [To-do]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the to-do item to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: To-do item updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: To-do item not found
 */

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a to-do item by ID
 *     tags: [To-do]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the to-do item to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: To-do item deleted successfully
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: To-do item not found
 */

/**
 * @swagger
 * /todos/file/{filename}:
 *   get:
 *     summary: Get a file related to a to-do item
 *     tags: [To-do]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         description: Name of the file to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
