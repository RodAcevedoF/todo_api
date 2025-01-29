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
    const book = await Book.create(req.user.id, req.body);
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
