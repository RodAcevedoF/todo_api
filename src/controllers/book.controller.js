/* import { validationResult } from "express-validator";
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

export const updateBook = async (req, res) => {
  try {
    console.log('Received Data in req.body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        errors.array().map((err) => err.msg),
        400
      );
    }
    const bookData = { ...req.body };

    if (req.file) {
      bookData.cover_image = req.file.filename;
    }

    if (Object.keys(bookData).length === 0) {
      return errorResponse(res, "No valid input", 400);
    }

    const book = await Book.update(req.params.id, req.user.id, bookData);

    if (!book) return errorResponse(res, "Book not found", 404);

    successResponse(res, book);
  } catch (error) {
    console.error('Error updating book:', error);
    errorResponse(res, error.message);
  }
}; */

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
    const { cover_image, ...bookData } = req.body;
    const book = await Book.create(req.user.id, {
      ...bookData,
      cover_image: cover_image || null
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
    return successResponse(res, books);
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
    const bookData = { ...req.body };
    if (req.file) {
      bookData.cover_image = req.file.filename;
    }
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
