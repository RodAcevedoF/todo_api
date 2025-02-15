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
      expiresIn: process.env.JWT_EXPIRES || "4h"
    });
  }

  static comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

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
