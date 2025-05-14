import { validationResult } from "express-validator";
import Todo from "../models/Todo.js";
import db from "../config/db.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map((err) => err.msg)
    });
  }

  try {
    const {
      title,
      description,
      deadline,
      priority,
      checked = false
    } = req.body; // Si no hay archivo, fileUrl será null

    const newTodo = await Todo.create(req.user.id, {
      title,
      description,
      deadline,
      priority,
      checked
    });

    res.status(201).json({
      success: true,
      data: newTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
export const updateTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map((err) => err.msg)
    });
  }

  try {
    const updates = req.body;
    if ("checked" in updates) {
      updates.checked = updates.checked === "true" || updates.checked === true;
    }
    const updatedTodo = await Todo.update(req.params.id, req.user.id, updates);

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found"
      });
    }

    res.json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
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
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
