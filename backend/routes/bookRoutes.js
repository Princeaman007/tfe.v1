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

// ✅ Récupérer le stock total de livres (accessible à tous)
router.get("/stock", getBooksStock);

// ✅ Récupérer un livre par ID (accessible à tous)
router.get("/:id", getBookById);

// ✅ Récupérer tous les livres avec pagination et recherche
router.get("/", getAllBooks);

// ✅ Ajouter un livre (PROTÉGÉ - Admin uniquement)
router.post("/", protect, isAdmin, addBook);

// ✅ Modifier un livre (PROTÉGÉ - Admin uniquement)
router.put("/:id", protect, isAdmin, updateBook);

// ✅ Supprimer un livre (PROTÉGÉ - Admin uniquement)
router.delete("/:id", protect, isAdmin, deleteBook);

router.post("/:id/like", protect, toggleLikeBook);

export default router;
