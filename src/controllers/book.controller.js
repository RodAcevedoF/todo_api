import { validationResult } from "express-validator";
import Book from "../models/Book.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map(err => err.msg),
      400
    );
  }
  try {
    const { cover_image, isbn, description, publisher, publish_date, ...bookData } = req.body;
    const book = await Book.create(req.user.id, {
      ...bookData,
      cover_image: cover_image || null,
      isbn: isbn || null,
      description: description || null,
      publisher: publisher || null,
      publish_date: publish_date || null,
    });
    return successResponse(res, book, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const books = await Book.findByUser(req.user.id, limit, offset);

    // Formatear publish_date para eliminar la hora y mantener solo YYYY-MM-DD
    const formattedBooks = books.map((book) => ({
      ...book,
      publish_date: book.publish_date
        ? book.publish_date.toISOString().split("T")[0] // Extrae solo la parte de la fecha
        : null,
    }));

    return successResponse(res, formattedBooks);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};


export const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.delete(req.params.id, req.user.id);
    if (!deleted) return errorResponse(res, "Book not found", 404);
    return successResponse(res, null, 204);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map(err => err.msg),
      400
    );
  }
  try {
    const { description, publisher, publish_date, ...bookData } = req.body;

    // Añade los nuevos campos al objeto `bookData`
    if (description) bookData.description = description;
    if (publisher) bookData.publisher = publisher;
    if (publish_date) bookData.publish_date = publish_date;

    if (Object.keys(bookData).length === 0) {
      return errorResponse(res, "No valid input", 400);
    }

    const book = await Book.update(req.params.id, req.user.id, bookData);
    if (!book) return errorResponse(res, "Book not found", 404);
    return successResponse(res, book);
  } catch (error) {
    console.error("Error updating book:", error);
    return errorResponse(res, error.message);
  }
};
