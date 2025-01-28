import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export default class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
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
      "SELECT id, name, email FROM users WHERE id = $1",
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
}
