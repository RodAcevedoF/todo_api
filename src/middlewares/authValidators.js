import { check } from "express-validator";

export const validateRegister = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
];

export const validateLogin = [
  check("email").isEmail().withMessage("Invalid email format"),
  check("password").notEmpty().withMessage("Password is required")
];

export const validateProfileUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty"),
  check("email").optional().isEmail().withMessage("Invalid email format"),
  check("phone")
    .optional()
    .matches(/^\+\d{1,3}\s?\d{4,14}$/)
    .withMessage("Invalid phone number format"),
  check("nickname").optional(),
  check("description").optional(),
  check("website").optional(),
  check("github_url").optional(),
  check("birth_date").optional().isISO8601().withMessage("Invalid date format"),
  check("hobbies").optional(),
  check("location").optional()
];

export const validateSensitiveUpdate = [
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  check("email").optional().isEmail().withMessage("Invalid email format"),
  check("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
];
