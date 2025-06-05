import { Router } from "express";
import upload from "../config/upload.js";
import { authenticate } from "../middlewares/auth.js";
import { requireVerifiedUser } from "../middlewares/requireVerifiedUser.js";
import {
  bookCreationValidator,
  bookUpdateValidator
} from "../middlewares/bookValidators.js";
import {
  createBook,
  getBooks,
  deleteBook,
  updateBook
} from "../controllers/book.controller.js";

const router = Router();

const excludeApiId = (req, res, next) => {
  if (req.body.apiId) delete req.body.apiId;
  next();
};

router.use(authenticate);
router.use(requireVerifiedUser);

router.post(
  "/",
  upload.single("cover_image"),
  bookCreationValidator,
  createBook
);
router.get("/", getBooks);
router.delete("/:id", deleteBook);
router.patch(
  "/:id",
  upload.single("cover_image"),
  excludeApiId,
  bookUpdateValidator,
  updateBook
);

export default router;
