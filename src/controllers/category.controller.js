import Category from "../models/Category.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Crear una nueva categoría
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorResponse(res, "El nombre de la categoría es obligatorio", 400);
    }

    const category = await Category.create(name);
    return successResponse(res, category, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Obtener todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return successResponse(res, categories);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Asociar categorías con un libro
export const addCategoriesToBook = async (req, res) => {
  const { bookId } = req.params;
  const { categories } = req.body; // Array de IDs de categorías

  if (!Array.isArray(categories) || categories.length === 0) {
    return errorResponse(res, "Debes proporcionar un arreglo de categorías válidas", 400);
  }

  try {
    await Category.associateWithBook(bookId, categories);
    const associatedCategories = await Category.findByBook(bookId);
    return successResponse(res, associatedCategories, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
