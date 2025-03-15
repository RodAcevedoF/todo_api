import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import { createBook, getBooks, deleteBook, updateBook } from "../controllers/book.controller.js";
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
    check("title").notEmpty().withMessage("El título es obligatorio"),
    check("author").notEmpty().withMessage("El autor es obligatorio"),
    check("notes").optional().isString().withMessage("Las notas deben ser texto"),
    check('isbn').optional().isString().withMessage('El ISBN debe ser un texto')
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
    check("title").optional().isString().withMessage("El título debe ser texto"),
    check("author").optional().isString().withMessage("El autor debe ser texto"),
    check("notes").optional().isString().withMessage("Las notas deben ser texto"),
    check('isbn').optional().isString().withMessage('El ISBN debe ser un texto')
  ],
  updateBook
);

export default router;

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Gestión de libros
 *
 * /api/books:
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del libro.
 *               author:
 *                 type: string
 *                 description: Autor del libro.
 *               notes:
 *                 type: string
 *                 description: Notas sobre el libro (opcional).
 *               isbn:
                   type: string
                   description: ISBN del libro (opcional).
 *               cover_image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de portada del libro (opcional).
 *     responses:
 *       201:
 *         description: Libro creado exitosamente.
 *       400:
 *         description: Error en la validación de datos.
 *
 *   get:
 *     summary: Obtener todos los libros del usuario
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de libros obtenida correctamente.
 *       401:
 *         description: No autorizado.
 *
 * /api/books/{id}:
 *   delete:
 *     summary: Eliminar un libro por ID
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro a eliminar.
 *     responses:
 *       204:
 *         description: Libro eliminado exitosamente.
 *       404:
 *         description: Libro no encontrado.
 *
 *   patch:
 *     summary: Actualizar un libro por ID
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro a actualizar.
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título del libro.
 *               author:
 *                 type: string
 *                 description: Nuevo autor del libro.
 *               notes:
 *                 type: string
 *                 description: Nuevas notas sobre el libro (opcional).
 *               isbn:
                   type: string
                   description: ISBN del libro (opcional). 
 *               cover_image:
 *                 type: string
 *                 format: binary
 *                 description: Nueva imagen de portada del libro (opcional).
 *     responses:
 *       200:
 *         description: Libro actualizado exitosamente.
 *       404:
 *         description: Libro no encontrado.
 */
