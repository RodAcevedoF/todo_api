/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The hashed password of the user
 *       required:
 *         - name
 *         - email
 *         - password
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found successfully
 *       404:
 *         description: User not found
 */
// src/models/User.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export default class User {
  static async create({
    name,
    email,
    password,
    description = null,
    profile_image = null,
    phone = null
  }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, description, profile_image, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, email, hashedPassword, description, profile_image, phone]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query(
      "SELECT id, name, email, description, profile_image, phone FROM users WHERE id = $1",
      [id]
    );
    return rows[0];
  }

  static generateToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "1h"
    });
  }

  static comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Método para actualizar el perfil del usuario
  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = [id, ...Object.values(updates)];
    const { rows } = await db.query(
      `UPDATE users 
       SET ${setClause} 
       WHERE id = $1 
       RETURNING id, name, email, description, profile_image, phone`,
      values
    );
    return rows[0];
  }
}
