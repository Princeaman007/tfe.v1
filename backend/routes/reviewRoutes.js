import express from "express";
import { addReview, getReviewsForBook,getMyReviews,deleteReview,updateReview} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


router.post("/", protect, addReview);
router.get("/me", protect, getMyReviews);
router.put("/:reviewId", protect, updateReview);   
router.delete("/:reviewId", protect, deleteReview); 
router.get("/:bookId", getReviewsForBook);          




export default router;
