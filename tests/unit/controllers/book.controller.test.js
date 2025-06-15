import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationResult } from "express-validator";
import {
  createBook,
  getBooks,
  updateBook,
  deleteBook
} from "../../../src/controllers/book.controller.js";
import Book from "../../../src/models/Book.js";

vi.mock("express-validator");

vi.mock("../../../src/utils/apiResponse.js", () => ({
  successResponse: vi.fn(),
  errorResponse: vi.fn()
}));

import {
  successResponse,
  errorResponse
} from "../../../src/utils/apiResponse.js";

describe("BookController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    vi.clearAllMocks();
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
  });

  describe("createBook", () => {
    it("should create a new book and return 201", async () => {
      req.body = {
        title: "My Book",
        pages: "300",
        categories: JSON.stringify([1, 2]),
        checked: false
      };
      const mockBook = { id: 1, title: "My Book" };
      vi.spyOn(Book, "create").mockResolvedValue(mockBook);

      await createBook(req, res);

      expect(Book.create).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(res, mockBook, 201);
    });

    it("should return 400 on validation error", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Title required" }]
      });

      await createBook(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, ["Title required"], 400);
    });
  });

  describe("getBooks", () => {
    it("should return books formatted", async () => {
      const books = [
        { id: 1, title: "Book 1", publish_date: new Date("2023-01-01") }
      ];
      vi.spyOn(Book, "findByUser").mockResolvedValue(books);

      await getBooks(req, res);

      expect(successResponse).toHaveBeenCalledWith(res, [
        { id: 1, title: "Book 1", publish_date: "2023-01-01" }
      ]);
    });
  });

  describe("updateBook", () => {
    it("should update book and return it", async () => {
      req.params.id = 1;
      req.body = { title: "Updated", pages: "123", categories: [1] };
      const updatedBook = { id: 1, title: "Updated" };

      vi.spyOn(Book, "update").mockResolvedValue(updatedBook);

      await updateBook(req, res);

      expect(successResponse).toHaveBeenCalledWith(res, updatedBook);
    });

    it("should return 400 if no valid input", async () => {
      req.body = {};

      await updateBook(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "No valid input", 400);
    });

    it("should return 404 if book not found", async () => {
      req.params.id = 1;
      req.body = { title: "Test" };
      vi.spyOn(Book, "update").mockResolvedValue(null);

      await updateBook(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Book not found", 404);
    });
  });

  describe("deleteBook", () => {
    it("should delete book and return 204", async () => {
      req.params.id = 1;
      vi.spyOn(Book, "delete").mockResolvedValue(true);

      await deleteBook(req, res);

      expect(successResponse).toHaveBeenCalledWith(res, null, 204);
    });

    it("should return 404 if book not found", async () => {
      req.params.id = 1;
      vi.spyOn(Book, "delete").mockResolvedValue(false);

      await deleteBook(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Book not found", 404);
    });
  });
});
