import express from "express";
import {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getBooksStock,
  getBookById,
} from "../controllers/bookController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes accessibles à tous
router.get("/stock", getBooksStock);
router.get("/:id", getBookById);
router.get("/", getAllBooks);


// Routes protégées (ADMIN uniquement)
router.post("/", protect, isAdmin, addBook);
router.put("/:id", protect, isAdmin, updateBook);
router.delete("/:id", protect, isAdmin, deleteBook);


export default router;
