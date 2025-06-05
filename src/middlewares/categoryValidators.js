import { check } from "express-validator";

export const categoryCreateValidator = [
  check("name").notEmpty().withMessage("Category name is required")
];

export const categoryToBookValidator = [
  check("categories").isArray().withMessage("Categories must be an array")
];
