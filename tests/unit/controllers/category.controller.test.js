import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCategory,
  getCategories,
  addCategoriesToBook
} from "../../../src/controllers/category.controller.js";
import Category from "../../../src/models/Category.js";
import {
  successResponse,
  errorResponse
} from "../../../src/utils/apiResponse.js";

vi.mock("../../../src/models/Category.js");
vi.mock("../../../src/utils/apiResponse.js");

describe("CategoryController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    vi.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create and return a category", async () => {
      req.body.name = "Fiction";
      const mockCategory = { id: 1, name: "Fiction" };
      vi.spyOn(Category, "create").mockResolvedValue(mockCategory);

      await createCategory(req, res);

      expect(Category.create).toHaveBeenCalledWith("Fiction");
      expect(successResponse).toHaveBeenCalledWith(res, mockCategory, 201);
    });

    it("should return 400 if name is missing", async () => {
      req.body = {};
      await createCategory(req, res);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Category name is required",
        400
      );
    });

    it("should handle errors", async () => {
      req.body.name = "Sci-Fi";
      vi.spyOn(Category, "create").mockRejectedValue(new Error("Insert error"));

      await createCategory(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Insert error");
    });
  });

  describe("getCategories", () => {
    it("should return categories", async () => {
      const mockList = [{ id: 1, name: "Drama" }];
      vi.spyOn(Category, "findAll").mockResolvedValue(mockList);

      await getCategories(req, res);

      expect(successResponse).toHaveBeenCalledWith(res, mockList);
    });

    it("should handle errors", async () => {
      vi.spyOn(Category, "findAll").mockRejectedValue(new Error("DB fail"));

      await getCategories(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "DB fail");
    });
  });

  describe("addCategoriesToBook", () => {
    it("should associate categories and return them", async () => {
      req.params.bookId = 2;
      req.body.categories = [1, 2];
      const associated = [{ id: 1 }, { id: 2 }];

      vi.spyOn(Category, "associateWithBook").mockResolvedValue();
      vi.spyOn(Category, "findByBook").mockResolvedValue(associated);

      await addCategoriesToBook(req, res);

      expect(Category.associateWithBook).toHaveBeenCalledWith(2, [1, 2]);
      expect(Category.findByBook).toHaveBeenCalledWith(2);
      expect(successResponse).toHaveBeenCalledWith(res, associated, 201);
    });

    it("should return 400 if categories array is missing", async () => {
      req.body.categories = null;

      await addCategoriesToBook(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "A categories array must be provided",
        400
      );
    });

    it("should handle errors", async () => {
      req.params.bookId = 2;
      req.body.categories = [1];
      vi.spyOn(Category, "associateWithBook").mockRejectedValue(
        new Error("Assoc error")
      );

      await addCategoriesToBook(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Assoc error");
    });
  });
});
