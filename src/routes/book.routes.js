/* import { Router } from "express";
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
 */

import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  createBook,
  getBooks,
  deleteBook,
  updateBook
} from "../controllers/book.controller.js";
import upload from "../config/upload.js"; // Importa tu configuración de multer

const router = Router();

router.use(authenticate);

// Ruta para crear un libro (maneja archivos si es necesario)
router.post(
  "/",
  upload.single("cover_image"), // Usa 'upload.none()' si no manejas archivos
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("author").notEmpty().withMessage("Author is required"),
    check("notes").optional().isString().withMessage("Notes must be a string")
  ],
  createBook
);

router.get("/", getBooks);

router.delete("/:id", deleteBook);

// Ruta para actualizar un libro
router.put(
  "/:id",
  upload.single("cover_image"), // Aplica el middleware de multer aquí también
  [
    check("title").optional().isString().withMessage("Title must be a string"),
    check("author").optional().isString().withMessage("Author must be a string"),
    check("notes").optional().isString().withMessage("Notes must be a string")
  ],
  updateBook
);

export default router;
