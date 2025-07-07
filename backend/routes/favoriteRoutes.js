// backend/routes/favoriteRoutes.js
import express from "express";
import {
  getUserFavorites,
  toggleFavorite,
  checkFavoriteStatus
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Routes protégées (utilisateur connecté requis)
router.get("/", protect, getUserFavorites);                    // GET /api/favorites
router.post("/toggle", protect, toggleFavorite);               // POST /api/favorites/toggle
router.get("/check/:bookId", protect, checkFavoriteStatus);    // GET /api/favorites/check/:bookId

export default router;