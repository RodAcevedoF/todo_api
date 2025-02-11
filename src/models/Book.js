/* import db from "../config/db.js";
export default class Book {
  static async create(
    userId,
    { apiId, title, author, notes, cover_image = null }
  ) {
    const { rows } = await db.query(
      `INSERT INTO books (user_id, api_id, title, author, notes, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, apiId, title, author, notes, cover_image]
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

  static async findById(id, userId) {
    const { rows } = await db.query(
      `SELECT * FROM books WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows[0];
  }

  static async update(
    id,
    userId,
    { apiId, title, author, notes, cover_image = null }
  ) {
    const { rows } = await db.query(
      `UPDATE books 
       SET api_id = $1, title = $2, author = $3, notes = $4, cover_image = $5
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [apiId, title, author, notes, cover_image, id, userId]
    );
    return rows[0];
  }
}
 */

// src/models/Book.js

import db from "../config/db.js";

export default class Book {
  static async create(
    userId,
    { apiId, title, author, notes, cover_image = null }
  ) {
    const { rows } = await db.query(
      `INSERT INTO books (user_id, api_id, title, author, notes, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, apiId, title, author, notes, cover_image]
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

  static async findById(id, userId) {
    const { rows } = await db.query(
      `SELECT * FROM books WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rows[0];
  }

  static async delete(id, userId) {
    const { rowCount } = await db.query(
      "DELETE FROM books WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }

  static async update(id, userId, data) {
    // Construir dinámicamente la cláusula SET en función de los campos proporcionados
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
      }
    }

    // Verificar que se proporcionaron campos para actualizar
    if (fields.length === 0) {
      throw new Error("No hay campos válidos para actualizar");
    }

    // Añadir 'id' y 'userId' a los valores para la cláusula WHERE
    values.push(id);
    values.push(userId);

    const query = `
      UPDATE books
      SET ${fields.join(', ')}
      WHERE id = $${index} AND user_id = $${index + 1}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }
}
