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

// ✅ CORRECTION: Chemins d'import fixes
import { handleValidationErrors } from '../middleware/validation.js';
import { 
  validateCreateBook, 
  validateUpdateBook, 
  validateBookId,
  validateBookSearch 
} from '../validators/bookValidators.js';

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Récupérer les livres (public avec filtres optionnels)
router.get("/", 
  validateBookSearch,  // Validation des filtres de recherche
  handleValidationErrors,
  getAllBooks
);

// ✅ Genres dynamiques (protégé Admin)
router.get("/genres", 
  protect, 
  isAdmin, 
  getGenres
);

// ✅ Statistiques sur les livres (admin uniquement)
router.get("/stats", 
  protect, 
  isAdmin, 
  getBookStats
);

// ✅ Stock (admin uniquement ou à usage interne)
router.get("/stock", 
  protect, 
  isAdmin, 
  getBooksStock
);

// ✅ Détail d'un livre
router.get("/:id", 
  validateBookId,  // Validation de l'ID MongoDB
  handleValidationErrors,
  getBookById
);

// ✅ Ajouter un livre (admin uniquement)
// CORRECTION: Un seul validateur pour la création
router.post("/", 
  protect, 
  isAdmin,
  validateCreateBook,  // ❌ AVANT: validateCreateBook + validateUpdateBook 
  handleValidationErrors, 
  addBook
);

// ✅ Modifier un livre (admin uniquement)
// CORRECTION: Validateur approprié pour la mise à jour
router.put("/:id", 
  protect, 
  isAdmin,
  validateBookId,      // Valider l'ID en paramètre
  validateUpdateBook,  // ❌ AVANT: validateCreateBook + validateUpdateBook
  handleValidationErrors, 
  updateBook
);

// ✅ Supprimer un livre (admin uniquement)
router.delete("/:id", 
  protect, 
  isAdmin,
  validateBookId,  // Validation de l'ID
  handleValidationErrors,
  deleteBook
);

// ✅ Like / Unlike d'un livre (user connecté)
router.post("/:id/like", 
  protect,
  validateBookId,  // Validation de l'ID du livre
  handleValidationErrors,
  toggleLikeBook
);

export default router;