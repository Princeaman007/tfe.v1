import express from "express";
import { addReview, getBookReviews, toggleLikeBook, getBookRating } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Ajouter un avis (Utilisateur uniquement)
router.post("/", protect, addReview);

// 🔹 Récupérer les avis d'un livre
router.get("/:bookId", getBookReviews);

// 🔹 Liker / Unliker un livre (Utilisateur uniquement)
router.post("/like", protect, toggleLikeBook);

// 🔹 Récupérer la note moyenne d'un livre
router.get("/rating/:bookId", getBookRating);

export default router;
