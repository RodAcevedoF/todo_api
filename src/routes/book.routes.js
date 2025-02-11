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
// src/routes/book.routes.js

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

// Middleware para excluir 'apiId' si se envía en la solicitud
const excludeApiId = (req, res, next) => {
  if (req.body.apiId) {
    delete req.body.apiId;
  }
  next();
};

router.use(authenticate);

// Ruta para crear un libro (maneja archivos si es necesario)
router.post(
  "/",
  upload.single("cover_image"), // Si no manejas archivos, puedes usar upload.none()
  [
    check("title").notEmpty().withMessage("El título es obligatorio"),
    check("author").notEmpty().withMessage("El autor es obligatorio"),
    check("notes").optional().isString().withMessage("Las notas deben ser texto")
  ],
  createBook
);

// Ruta para obtener los libros del usuario autenticado
router.get("/", getBooks);

// Ruta para eliminar un libro
router.delete("/:id", deleteBook);

// Ruta para actualizar un libro (actualización parcial)
router.patch(
  "/:id",
  upload.single("cover_image"), // Si no manejas archivos, puedes usar upload.none()
  excludeApiId,
  [
    check("title").optional().isString().withMessage("El título debe ser texto"),
    check("author").optional().isString().withMessage("El autor debe ser texto"),
    check("notes").optional().isString().withMessage("Las notas deben ser texto")
  ],
  updateBook
);

export default router;
