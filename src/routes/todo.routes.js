import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
} from "../controllers/todo.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createTodo);
router.get("/", getTodos);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
