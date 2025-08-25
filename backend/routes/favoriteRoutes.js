
import express from "express";
import {
  getUserFavorites,
  toggleFavorite,
  checkFavoriteStatus
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Routes protégées (utilisateur connecté requis)
router.get("/", protect, getUserFavorites);                    
router.post("/toggle", protect, toggleFavorite);               
router.get("/check/:bookId", protect, checkFavoriteStatus);    

export default router;