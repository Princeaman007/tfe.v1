import express from "express";
import { addReview, getReviewsForBook } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

// ✅ Ajouter un avis (nécessite d’être connecté)
router.post("/", protect, addReview);

// ✅ Récupérer les avis d’un livre
router.get("/:bookId", getReviewsForBook);

router.delete("/:reviewId", protect, deleteReview);



export default router;
