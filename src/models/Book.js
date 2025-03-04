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

    if (fields.length === 0) {
      throw new Error("No hay campos válidos para actualizar");
    }

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
 */
import db from "../config/db.js";

export default class Book {
  // Verifica si el libro ya existe para un usuario dado
  static async exists(userId, apiId) {
    const { rows } = await db.query(
      "SELECT id FROM books WHERE user_id = $1 AND api_id = $2",
      [userId, apiId]
    );
    return rows.length > 0;
  }

  // Crea un nuevo libro, si no existe previamente
  static async create(userId, { apiId, title, author, notes, cover_image = null }) {
    if (await this.exists(userId, apiId)) {
      throw new Error("El libro ya está guardado.");
    }
    const { rows } = await db.query(
      `INSERT INTO books (user_id, api_id, title, author, notes, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, apiId, title, author, notes, cover_image]
    );
    return rows[0];
  }

  // Obtiene los libros de un usuario con paginación
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

  // Obtiene un libro por su ID y el usuario
  static async findById(id, userId) {
    const { rows } = await db.query(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rows[0];
  }

  // Elimina un libro dado su ID y usuario
  static async delete(id, userId) {
    const { rowCount } = await db.query(
      "DELETE FROM books WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }

  // Actualiza campos del libro; se evita actualizar el apiId
  static async update(id, userId, data) {
    const keys = Object.keys(data).filter((key) => key !== "apiId");
    if (!keys.length) throw new Error("No hay campos válidos para actualizar");

    const fields = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = keys.map((key) => data[key]);
    // Agregamos el id y userId al final
    values.push(id, userId);

    const query = `
      UPDATE books
      SET ${fields.join(", ")}
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING *
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}
