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

router.use(authenticate);

router.post(
  "/",
  upload.none(),
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
    check("cover_image").optional().isString().withMessage("Cover image must be a string")
  ],
  createBook
);

router.get("/", getBooks);

router.delete("/:id", deleteBook);

router.put(
  "/:id",
  upload.none(),
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
    check("cover_image").optional().isString().withMessage("Cover image must be a string")
  ],
  updateBook
);

export default router;
