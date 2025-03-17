import express from "express";
import { borrowBook, returnBook, getUserRentals,getAllRentals,
    getUserRentalsByAdmin } from "../controllers/rentalController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes protégées (Utilisateur connecté uniquement)
router.post("/borrow", protect, borrowBook);
router.post("/return", protect, returnBook);
router.get("/", protect, getUserRentals);
// 🔹 Gestion des locations (Superadmin uniquement)
router.get("/admin/all", protect, isSuperAdmin, getAllRentals);
router.get("/admin/user/:userId", protect, isSuperAdmin, getUserRentalsByAdmin);


export default router;
