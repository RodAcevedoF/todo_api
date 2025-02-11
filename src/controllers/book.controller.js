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
    const { cover_image, ...bookData } = req.body;
    const book = await Book.create(req.user.id, {
      ...bookData,
      cover_image: cover_image || null
    });
    successResponse(res, book, 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const books = await Book.findByUser(req.user.id, limit, offset);
    successResponse(res, books);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.delete(req.params.id, req.user.id);
    if (!deleted) return errorResponse(res, "Book not found", 404);
    successResponse(res, null, 204);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

/* export const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors.array().map((err) => err.msg),
      400
    );
  }
  try {
    const { cover_image, ...bookData } = req.body;
    const book = await Book.update(req.params.id, req.user.id, {
      ...bookData,
      cover_image: cover_image || null
    });
    if (!book) return errorResponse(res, "Book not found", 404);
    successResponse(res, book);
  } catch (error) {
    errorResponse(res, error.message);
  }
};
 */
export const updateBook = async (req, res) => {
  try {
    console.log('Datos recibidos en req.body:', req.body);
    console.log('Archivo recibido:', req.file);

    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        errors.array().map((err) => err.msg),
        400
      );
    }

    // Crear 'bookData' a partir de 'req.body' y 'req.file'
    const bookData = { ...req.body };

    // Si recibiste un archivo, actualiza 'cover_image'
    if (req.file) {
      bookData.cover_image = req.file.filename;
    }

    // Verificar que 'bookData' no esté vacío
    if (Object.keys(bookData).length === 0) {
      return errorResponse(res, "No hay campos válidos para actualizar", 400);
    }

    // Actualizar el libro
    const book = await Book.update(req.params.id, req.user.id, bookData);

    if (!book) return errorResponse(res, "Book not found", 404);

    successResponse(res, book);
  } catch (error) {
    console.error('Error al actualizar el libro:', error);
    errorResponse(res, error.message);
  }
};