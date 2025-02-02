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
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The time the todo was created
 *       required:
 *         - title
 *         - description
 *         - deadline
 *         - fileUrl
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
 *         application/json:
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
 *               fileUrl:
 *                 type: string
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
 *         required: true
 *         schema:
 *           type: integer
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       400:
 *         description: Validation error
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
 *         required: true
 *         schema:
 *           type: integer
 *         description: The todo ID
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 *       404:
 *         description: Todo not found
 */
import db from "../config/db.js";

export default class Todo {
  static async create(userId, { title, description, deadline, fileUrl }) {
    const { rows } = await db.query(
      `INSERT INTO todos (user_id, title, description, deadline, file_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, title, description, deadline, fileUrl]
    );
    return rows[0];
  }

  static async findByUser(userId, limit = 10, offset = 0) {
    const { rows } = await db.query(
      `SELECT * FROM todos 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async update(id, userId, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(", ");
    const { rows } = await db.query(
      `UPDATE todos 
       SET ${setClause} 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId, ...Object.values(updates)]
    );
    return rows[0];
  }
}
