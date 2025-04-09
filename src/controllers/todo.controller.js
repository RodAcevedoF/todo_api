import { validationResult } from "express-validator";
import Todo from "../models/Todo.js";
import upload from "../config/upload.js";
import db from "../config/db.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import path from "path";
import fs from "fs";
import config from "../config/config.js";

export const uploadFile = upload.single("file");

export const createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map((err) => err.msg)
    });
  }

  try {
    const { title, description, deadline, priority } = req.body;
    const fileUrl = req.file ? req.file.path : null; // Si no hay archivo, fileUrl será null

    const newTodo = await Todo.create(req.user.id, {
      title,
      description,
      deadline,
      fileUrl,
      priority
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
    if (req.file) updates.fileUrl = req.file.path; // Si hay archivo, lo asignamos a fileUrl

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
    const { rowCount } = await db.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return errorResponse(res, "Todo not found", 404);
    }

    successResponse(res, null, 204);
  } catch (error) {
    errorResponse(res, error.message, 500);
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

export const getFile = async (req, res) => {
  try {
    const filePath = path.join(
      config.uploadDir || "uploads",
      req.params.filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found"
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error serving file"
    });
  }
};
