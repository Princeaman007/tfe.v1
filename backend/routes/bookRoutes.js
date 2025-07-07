import express from "express";
import {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getBooksStock,
  getBookById,
  toggleLikeBook
} from "../controllers/bookController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/stock", getBooksStock);


router.get("/:id", getBookById);


router.get("/", getAllBooks);


router.post("/", protect, isAdmin, addBook);


router.put("/:id", protect, isAdmin, updateBook);


router.delete("/:id", protect, isAdmin, deleteBook);

router.post("/:id/like", protect, toggleLikeBook);

export default router;
