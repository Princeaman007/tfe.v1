import express from "express";
import { addReview, getReviewsForBook } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { deleteReview } from "../controllers/reviewController.js";

const router = express.Router();


router.post("/", protect, addReview);


router.get("/:bookId", getReviewsForBook);

router.delete("/:reviewId", protect, deleteReview);



export default router;
