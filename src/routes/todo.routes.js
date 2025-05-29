import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
} from "../controllers/todo.controller.js";
import {
  validateCreateTodo,
  validateUpdateTodo
} from "../middlewares/todoValidators.js";
import { handleValidationErrors } from "../middlewares/validation.js";

const router = Router();

router.use(authenticate);

router.post("/", validateCreateTodo, handleValidationErrors, createTodo);
router.get("/", getTodos);
router.put("/:id", validateUpdateTodo, handleValidationErrors, updateTodo);
router.delete("/:id", deleteTodo);

export default router;
