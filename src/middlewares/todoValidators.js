import { body } from "express-validator";

export const validateCreateTodo = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be a valid date")
];

export const validateUpdateTodo = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty if provided"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Invalid deadline date format")
];
