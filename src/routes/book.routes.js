import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  createBook,
  getBooks,
  deleteBook,
  updateBook
} from "../controllers/book.controller.js";
import upload from "../config/upload.js";

const router = Router();

// Middleware para eliminar apiId en actualización (no se debe actualizar)
const excludeApiId = (req, res, next) => {
  if (req.body.apiId) delete req.body.apiId;
  next();
};

router.use(authenticate);

router.post(
  "/",
  upload.single("cover_image"),
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be text"),
    check("isbn").optional().isString().withMessage("ISBN must be text"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be text"),
    check("publisher")
      .optional()
      .isString()
      .withMessage("Publisher must be text"),
    check("publish_date")
      .optional()
      .isISO8601()
      .withMessage("Publish date must be valid"),
    check("pages")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("Pages number must be 0 or a positive number."),
    check("checked")
      .optional()
      .isBoolean()
      .withMessage("Field 'checked' must be boolean")
  ],
  createBook
);

router.get("/", getBooks);

router.delete("/:id", deleteBook);

router.patch(
  "/:id",
  upload.single("cover_image"),
  excludeApiId,
  [
    check("title").optional().isString().withMessage("Title must be text"),
    check("author").optional().isString().withMessage("Author must be text"),
    check("notes").optional().isString().withMessage("Notes must be text"),
    check("isbn").optional().isString().withMessage("ISBN must be text"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be text"),
    check("publisher")
      .optional()
      .isString()
      .withMessage("Publisher must be text"),
    check("publish_date")
      .optional()
      .isISO8601()
      .withMessage("Publish date must be valid"),
    check("pages")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("Pages number must be 0 or a positive number."),
    check("checked")
      .optional()
      .isBoolean()
      .withMessage("Field 'checked' must be boolean")
  ],
  updateBook
);

export default router;
