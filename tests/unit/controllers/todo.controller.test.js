import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationResult } from "express-validator";
import {
  createTodo,
  updateTodo,
  deleteTodo,
  getTodos
} from "../../../src/controllers/todo.controller.js";
import Todo from "../../../src/models/Todo.js";

vi.mock("express-validator");

describe("TodoController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
    validationResult.mockReturnValue({ isEmpty: () => true });
  });

  describe("createTodo", () => {
    it("should create a new todo and return 201", async () => {
      req.body = {
        title: "Test",
        description: "Desc",
        deadline: "2025-12-01",
        priority: "high",
        checked: false
      };
      const mockTodo = { id: 1, ...req.body };

      vi.spyOn(Todo, "create").mockResolvedValue(mockTodo);

      await createTodo(req, res);

      expect(Todo.create).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo
      });
    });

    it("should return 400 on validation error", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Title is required" }]
      });

      await createTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Title is required"
      });
    });

    it("should return 400 on creation error", async () => {
      req.body = {
        title: "Test",
        description: "Desc",
        deadline: "2025-12-01",
        priority: "high"
      };

      vi.spyOn(Todo, "create").mockRejectedValue(new Error("DB Error"));

      await createTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error"
      });
    });
  });

  describe("updateTodo", () => {
    it("should update a todo and return it", async () => {
      req.params.id = "1";
      req.body = { title: "Updated", checked: "true" };
      const updated = { id: 1, title: "Updated", checked: true };

      vi.spyOn(Todo, "update").mockResolvedValue(updated);

      await updateTodo(req, res);

      expect(Todo.update).toHaveBeenCalledWith("1", 1, {
        title: "Updated",
        checked: true
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updated
      });
    });

    it("should return 404 if todo not found", async () => {
      req.params.id = "1";
      req.body = { title: "Updated" };
      vi.spyOn(Todo, "update").mockResolvedValue(null);

      await updateTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Todo not found"
      });
    });

    it("should return 400 on update error", async () => {
      req.params.id = "1";
      req.body = { title: "Error" };
      vi.spyOn(Todo, "update").mockRejectedValue(new Error("Update failed"));

      await updateTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Update failed"
      });
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo and return 204", async () => {
      req.params.id = "1";
      vi.spyOn(Todo, "delete").mockResolvedValue(true);

      await deleteTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null
      });
    });

    it("should return 404 if not found", async () => {
      req.params.id = "1";
      vi.spyOn(Todo, "delete").mockResolvedValue(false);

      await deleteTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Todo not found"
      });
    });

    it("should return 500 on delete error", async () => {
      req.params.id = "1";
      vi.spyOn(Todo, "delete").mockRejectedValue(new Error("DB crash"));

      await deleteTodo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB crash"
      });
    });
  });

  describe("getTodos", () => {
    it("should return todos for the user", async () => {
      req.query = { limit: "2", offset: "0" };
      const todos = [{ id: 1 }, { id: 2 }];
      vi.spyOn(Todo, "findByUser").mockResolvedValue(todos);

      await getTodos(req, res);

      expect(Todo.findByUser).toHaveBeenCalledWith(1, 2, 0);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: todos
      });
    });

    it("should default to limit 10 and offset 0", async () => {
      const todos = [];
      vi.spyOn(Todo, "findByUser").mockResolvedValue(todos);

      await getTodos(req, res);

      expect(Todo.findByUser).toHaveBeenCalledWith(1, 10, 0);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: todos
      });
    });

    it("should return 500 on fetch error", async () => {
      vi.spyOn(Todo, "findByUser").mockRejectedValue(new Error("Query error"));

      await getTodos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Query error"
      });
    });
  });
});
