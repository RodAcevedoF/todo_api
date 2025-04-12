import { validationResult } from "express-validator";
import Book from "../models/Book.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const {
      pages,
      cover_image,
      isbn,
      description,
      publisher,
      publish_date,
      categories = [],
      ...bookData
    } = req.body;

    // Asegurarse de que `categories` sea un arreglo
    let parsedCategories = categories;
    if (typeof categories === "string") {
      try {
        parsedCategories = JSON.parse(categories); // Parsear si viene como JSON
      } catch (error) {
        parsedCategories = []; // Si falla el parseo, usar un arreglo vacío
      }
    }

    if (!Array.isArray(parsedCategories)) {
      parsedCategories = [];
    }

    const book = await Book.create(req.user.id, {
      ...bookData,
      pages: typeof pages === "number" ? pages : null, // Incluimos el número de páginas
      cover_image: cover_image || null,
      isbn: isbn || null,
      description: description || null,
      publisher: publisher || null,
      publish_date: publish_date || null,
      categories: parsedCategories // Enviamos las categorías procesadas
    });
    console.log(bookData);

    return successResponse(res, book, 201);
  } catch (error) {
    console.error("Error en createBook:", error.message);
    return errorResponse(res, error.message);
  }
};

export const getBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const books = await Book.findByUser(req.user.id, limit, offset);

    const formattedBooks = books.map((book) => ({
      ...book,
      publish_date: book.publish_date
        ? book.publish_date.toISOString().split("T")[0] // Mantener solo la fecha
        : null
    }));

    return successResponse(res, formattedBooks);
  } catch (error) {
    console.error("Error en getBooks:", error.message);
    return errorResponse(res, error.message);
  }
};

export const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.delete(req.params.id, req.user.id);
    if (!deleted) return errorResponse(res, "Book not found", 404);
    return successResponse(res, null, 204);
  } catch (error) {
    console.error("Error en deleteBook:", error.message);
    return errorResponse(res, error.message);
  }
};

export const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }

  try {
    const {
      pages,
      description,
      publisher,
      publish_date,
      categories = [],
      ...bookData
    } = req.body;

    // Procesar categorías si están presentes
    let parsedCategories = categories;
    if (typeof categories === "string") {
      try {
        parsedCategories = JSON.parse(categories); // Parsear JSON
      } catch (error) {
        parsedCategories = [];
      }
    }

    if (!Array.isArray(parsedCategories)) {
      parsedCategories = [];
    }

    if (pages !== undefined) bookData.pages = pages; // Incluimos `pages` si está presente
    if (description) bookData.description = description;
    if (publisher) bookData.publisher = publisher;
    if (publish_date) bookData.publish_date = publish_date;
    if (parsedCategories.length > 0) bookData.categories = parsedCategories; // Incluimos categorías

    if (Object.keys(bookData).length === 0) {
      return errorResponse(res, "No valid input", 400);
    }

    const book = await Book.update(req.params.id, req.user.id, bookData);
    if (!book) return errorResponse(res, "Book not found", 404);

    return successResponse(res, book);
  } catch (error) {
    console.error("Error en updateBook:", error.message);
    return errorResponse(res, error.message);
  }
};
