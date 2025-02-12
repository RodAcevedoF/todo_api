import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { uploadMiddleware } from "../middlewares/upload.js";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  getFile
} from "../controllers/todo.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", uploadMiddleware, createTodo);
router.get("/", getTodos);
router.put("/:id", uploadMiddleware, updateTodo);
router.delete("/:id", deleteTodo);

router.get("/file/:filename", getFile);

export default router;
/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Gestión de tareas
 *
 * /api/todos:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Todos]
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
 *                 description: Título de la tarea.
 *               description:
 *                 type: string
 *                 description: Descripción de la tarea.
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento de la tarea (opcional).
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo adjunto a la tarea (opcional).
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente.
 *       400:
 *         description: Error en la validación de datos.
 *
 *   get:
 *     summary: Obtener todas las tareas del usuario
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida correctamente.
 *       401:
 *         description: No autorizado.
 *
 * /api/todos/{id}:
 *   put:
 *     summary: Actualizar una tarea por ID
 *     tags: [Todos]
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
 *         description: ID de la tarea a actualizar.
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título de la tarea.
 *               description:
 *                 type: string
 *                 description: Nueva descripción de la tarea.
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de vencimiento de la tarea (opcional).
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo adjunto a la tarea (opcional).
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente.
 *       404:
 *         description: Tarea no encontrada.
 *
 *   delete:
 *     summary: Eliminar una tarea por ID
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea a eliminar.
 *     responses:
 *       204:
 *         description: Tarea eliminada exitosamente.
 *       404:
 *         description: Tarea no encontrada.
 *
 * /api/todos/file/{filename}:
 *   get:
 *     summary: Obtener un archivo adjunto de una tarea
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo a descargar.
 *     responses:
 *       200:
 *         description: Archivo obtenido exitosamente.
 *       404:
 *         description: Archivo no encontrado.
 */
