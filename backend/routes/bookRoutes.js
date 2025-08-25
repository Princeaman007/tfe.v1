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


import { handleValidationErrors } from '../middleware/validation.js';
import { 
  validateCreateBook, 
  validateUpdateBook, 
  validateBookIdParam,
  validateBookSearch 
} from '../validators/bookValidators.js';

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", 
  validateBookSearch,  
  handleValidationErrors,
  getAllBooks
);

//  Genres dynamiques (protégé Admin)
router.get("/genres", 
  protect, 
  isAdmin, 
  getGenres
);

//  Statistiques sur les livres (admin uniquement)
router.get("/stats", 
  protect, 
  isAdmin, 
  getBookStats
);

//  Stock (admin uniquement ou à usage interne)
router.get("/stock", 
  protect, 
  isAdmin, 
  getBooksStock
);

//  Détail d'un livre
router.get("/:id", 
  validateBookIdParam,  
  handleValidationErrors,
  getBookById
);

//  Ajouter un livre (admin uniquement)
// CORRECTION: Un seul validateur pour la création
router.post("/", 
  protect, 
  isAdmin,
  validateCreateBook,   
  handleValidationErrors, 
  addBook
);

// Modifier un livre (admin uniquement)
// CORRECTION: Validateur approprié pour la mise à jour
router.put("/:id", 
  protect, 
  isAdmin,
  validateBookIdParam,      
  validateUpdateBook,  
  handleValidationErrors, 
  updateBook
);

//  Supprimer un livre (admin uniquement)
router.delete("/:id", 
  protect, 
  isAdmin,
  validateBookIdParam,  
  handleValidationErrors,
  deleteBook
);

// Like / Unlike d'un livre (user connecté)
router.post("/:id/like", 
  protect,
  validateBookIdParam,  
  handleValidationErrors,
  toggleLikeBook
);

export default router;