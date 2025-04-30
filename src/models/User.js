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
    phone = null,
    website = null,
    github_url = null,
    birth_date = null,
    hobbies = null,
    location = null,
    nickname = null
  }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generar nickname único si no se proporciona
      if (!nickname) {
        let isUnique = false;
        let generatedNickname = "";
        const base = name.trim().toLowerCase().replace(/\s+/g, "");

        while (!isUnique) {
          const randomNumber = Math.floor(100000 + Math.random() * 900000);
          generatedNickname = `@${base}${randomNumber}`;
          const { rows } = await db.query(
            "SELECT 1 FROM users WHERE nickname = $1",
            [generatedNickname]
          );
          isUnique = rows.length === 0;
        }

        nickname = generatedNickname;
      }

      const { rows } = await db.query(
        `INSERT INTO users 
            (name, email, password, description, profile_image, phone, website, github_url, birth_date, hobbies, location, nickname) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *`,
        [
          name,
          email,
          hashedPassword,
          description,
          profile_image,
          phone,
          website,
          github_url,
          birth_date,
          hobbies,
          location,
          nickname
        ]
      );

      return rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user.");
    }
  }

  static async findById(id) {
    const { rows } = await db.query(
      `SELECT id, name, email, description, profile_image, phone, website, github_url, birth_date, hobbies, location, nickname 
       FROM users 
       WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);
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
       RETURNING id, name, email, description, profile_image, phone, website, github_url, birth_date, hobbies, location, nickname`,
      values
    );
    return rows[0];
  }

  static async updateProfileImage(id, profileImagePath) {
    const { rows } = await db.query(
      `UPDATE users 
       SET profile_image = $1 
       WHERE id = $2 
       RETURNING id, name, email, description, profile_image, phone, website, github_url, birth_date, hobbies, location, nickname`,
      [profileImagePath, id]
    );
    return rows[0];
  }

  static async deleteUser(id) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Eliminar refresh tokens relacionados con el usuario
      await client.query("DELETE FROM refresh_tokens WHERE user_id = $1", [id]);

      // Eliminar usuario
      await client.query("DELETE FROM users WHERE id = $1", [id]);

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user.");
    } finally {
      client.release();
    }
  }
}
