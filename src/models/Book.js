import db from "../config/db.js";
import Category from "./Category.js";

export default class Book {
  // Verifica si el libro ya existe para un usuario dado
  static async exists(userId, apiId) {
    const { rows } = await db.query(
      "SELECT id FROM books WHERE user_id = $1 AND api_id = $2",
      [userId, apiId]
    );
    return rows.length > 0;
  }

  static async create(
    userId,
    {
      apiId,
      title,
      author,
      notes,
      cover_image = null,
      isbn = null,
      description = null,
      publisher = null,
      publish_date = null,
      pages = null,
      categories = []
    }
  ) {
    if (await this.exists(userId, apiId)) {
      throw new Error("Book already registered.");
    }

    const query = `
      INSERT INTO books (user_id, api_id, title, author, notes, cover_image, isbn, description, publisher, publish_date, pages) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      userId,
      apiId,
      title,
      author,
      notes,
      cover_image,
      isbn,
      description,
      publisher,
      publish_date,
      pages
    ]);

    const book = rows[0];

    // Asociar categorías si se proporcionan
    if (categories.length > 0) {
      const categoryIds = await Category.ensureCategoriesExist(categories); // Crear categorías si no existen
      await Category.associateWithBook(book.id, categoryIds); // Asociar categorías con el libro
    }

    return book;
  }

  static async findByUser(userId, limit = 10, offset = 0) {
    const query = `
        SELECT * FROM books
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
    const { rows } = await db.query(query, [userId, limit, offset]);

    const booksWithCategories = await Promise.all(
      rows.map(async (book) => {
        const categories = await Category.findByBook(book.id);
        return { ...book, categories };
      })
    );

    return booksWithCategories;
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

  static async update(id, userId, data) {
    const keys = Object.keys(data).filter(
      (key) =>
        key !== "apiId" &&
        key !== "id" &&
        [
          "title",
          "author",
          "notes",
          "cover_image",
          "isbn",
          "description",
          "publisher",
          "publish_date",
          "pages"
        ].includes(key) // Agregamos "pages"
    );

    if (!keys.length) throw new Error("No hay campos válidos para actualizar");

    const fields = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = keys.map((key) => data[key]);

    // Agregamos el id y userId al final de los valores
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
