import { validationResult } from "express-validator";
import Todo from "../models/Todo.js";
import db from "../config/db.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors
        .array()
        .map((err) => err.msg)
        .join("; "),
      400
    );
  }

  try {
    const {
      title,
      description,
      deadline,
      priority,
      checked = false
    } = req.body;

    const newTodo = await Todo.create(req.user.id, {
      title,
      description,
      deadline,
      priority,
      checked
    });

    return successResponse(res, newTodo, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      errors
        .array()
        .map((err) => err.msg)
        .join("; "),
      400
    );
  }

  try {
    const updates = req.body;
    if ("checked" in updates) {
      updates.checked = updates.checked === "true" || updates.checked === true;
    }

    const updatedTodo = await Todo.update(req.params.id, req.user.id, updates);

    if (!updatedTodo) {
      return errorResponse(res, "Todo not found", 404);
    }

    return successResponse(res, updatedTodo);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const deleted = await Todo.delete(req.params.id, req.user.id);

    if (!deleted) {
      return errorResponse(res, "Todo not found", 404);
    }

    return successResponse(res, null, 204);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getTodos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const todos = await Todo.findByUser(req.user.id, limit, offset);
    return successResponse(res, todos);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
