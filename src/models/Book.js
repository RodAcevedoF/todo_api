import db from "../config/db.js";

export default class Book {
  static async create(userId, { apiId, title, author, notes }) {
    const { rows } = await db.query(
      `INSERT INTO books (user_id, api_id, title, author, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, apiId, title, author, notes]
    );
    return rows[0];
  }

  static async findByUser(userId, limit = 10, offset = 0) {
    const { rows } = await db.query(
      `SELECT * FROM books 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async delete(id, userId) {
    const { rowCount } = await db.query(
      "DELETE FROM books WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }

  static async update(id, userId, { apiId, title, author, notes }) {
    const { rows } = await db.query(
      `UPDATE books 
       SET api_id = $1, title = $2, author = $3, notes = $4 
       WHERE id = $5 AND user_id = $6 
       RETURNING *`,
      [apiId, title, author, notes, id, userId]
    );
    return rows[0];
  }
}
