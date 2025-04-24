import db from "../config/db.js";

export default class Category {
  // Crear una nueva categoría
  static async create(name) {
    const query = `INSERT INTO categories (name) VALUES ($1) RETURNING *`;
    const { rows } = await db.query(query, [name]);
    return rows[0];
  }

  // Asegurarse de que las categorías existan (crear si no existen)
  static async ensureCategoriesExist(names) {
    if (!Array.isArray(names)) {
      throw new Error("Names parameter must be an array.");
    }

    const categories = await Promise.all(
      names.map(async (name) => {
        const query = `INSERT INTO categories (name)
                       VALUES ($1)
                       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                       RETURNING *`;
        const { rows } = await db.query(query, [name]);
        return rows[0];
      })
    );

    return categories.map((category) => category.id);
  }

  // Obtener todas las categorías
  static async findAll() {
    const query = `SELECT * FROM categories ORDER BY name ASC`;
    const { rows } = await db.query(query);
    return rows;
  }

  // Buscar categorías asociadas a un libro
  static async findByBook(bookId) {
    const query = `
      SELECT c.id, c.name
      FROM categories c
      INNER JOIN book_categories bc ON c.id = bc.category_id
      WHERE bc.book_id = $1
    `;
    const { rows } = await db.query(query, [bookId]);
    return rows;
  }

  // Asociar un libro con múltiples categorías
  static async associateWithBook(bookId, categoryIds) {
    const query = `
      INSERT INTO book_categories (book_id, category_id)
      SELECT $1, UNNEST($2::int[])
      ON CONFLICT DO NOTHING
    `;
    await db.query(query, [bookId, categoryIds]);
  }

  // Eliminar asociaciones de un libro con categorías
  static async removeAssociations(bookId) {
    const query = `DELETE FROM book_categories WHERE book_id = $1`;
    await db.query(query, [bookId]);
  }
}
