import express from "express";
import {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getBooksStock,
  getBookById,
  toggleLikeBook,
  getBookStats,
  getGenres
} from "../controllers/bookController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Récupérer les livres (public avec filtres)
router.get("/", getAllBooks);

// ✅ Genres dynamiques (protégé Admin)
router.get("/genres", protect, isAdmin, getGenres);

// ✅ Statistiques sur les livres (admin uniquement)
router.get("/stats", protect, isAdmin, getBookStats);

// ✅ Stock (admin uniquement ou à usage interne)
router.get("/stock", protect, isAdmin, getBooksStock);

// ✅ Détail d’un livre
router.get("/:id", getBookById);

// ✅ Ajouter, modifier, supprimer (admin uniquement)
router.post("/", protect, isAdmin, addBook);
router.put("/:id", protect, isAdmin, updateBook);
router.delete("/:id", protect, isAdmin, deleteBook);

// ✅ Like / Unlike d’un livre (user connecté)
router.post("/:id/like", protect, toggleLikeBook);

export default router;
