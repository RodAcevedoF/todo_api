import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { requireVerifiedUser } from "../middlewares/requireVerifiedUser.js";
import {
  createCategory,
  getCategories,
  addCategoriesToBook
} from "../controllers/category.controller.js";
import {
  categoryCreateValidator,
  categoryToBookValidator
} from "../middlewares/categoryValidators.js";

const router = Router();

router.use(authenticate);
router.use(requireVerifiedUser);

router.post("/", categoryCreateValidator, createCategory);
router.get("/", getCategories);
router.post("/books/:bookId", categoryToBookValidator, addCategoriesToBook);

export default router;
