// backend/routes/rentalRoutes.js - Mise à jour
import express from "express";
import {
  borrowBook,
  returnBook,
  getUserRentals,
  getAllRentals,
  getUserRentalsByAdmin,
  checkOverdueRentals,
  getUserRentalsDetailed,
  returnBookImproved,
  sendFineNotification,
  getMonthlyRentals
} from "../controllers/rentalController.js";

import { protect } from "../middleware/authMiddleware.js";
import Rental from "../models/rentalModel.js";

const router = express.Router();

// ✅ Nouveau middleware : admin OU superAdmin
const isAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin" || role === "superAdmin") {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé : rôle admin ou superAdmin requis." });
};

// 🔹 Routes protégées pour les utilisateurs connectés
router.post("/borrow", protect, borrowBook);
router.post("/return", protect, returnBookImproved);
router.get("/", protect, getUserRentals);
router.get("/detailed", protect, getUserRentalsDetailed);

// 🔹 Gestion des locations (admin ou superAdmin)
router.get("/admin/all", protect, isAdminOrSuperAdmin, getAllRentals);
router.get("/admin/user/:userId", protect, isAdminOrSuperAdmin, getUserRentalsByAdmin);
router.get("/admin/monthly", protect, isAdminOrSuperAdmin, getMonthlyRentals);

// 🔹 Gestion des retards
router.get("/admin/overdue", protect, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const overdueRentals = await Rental.find({ overdue: true })
      .populate("user", "name email")
      .populate("book", "title author");
    res.status(200).json(overdueRentals);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.get("/admin/check-overdue", protect, isAdminOrSuperAdmin, async (req, res) => {
  try {
    await checkOverdueRentals();
    res.status(200).json({ message: "Vérification des livres en retard effectuée avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la vérification des retards.", error: error.message });
  }
});

router.get("/admin/fines", protect, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const unpaidFines = await Rental.find({ fineAmount: { $gt: 0 }, finePaid: false })
      .populate("user", "name email")
      .populate("book", "title author");

    res.status(200).json(unpaidFines);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.get("/admin/send-fine-notifications", protect, isAdminOrSuperAdmin, async (req, res) => {
  try {
    await sendFineNotification();
    res.status(200).json({ message: "Emails de rappel pour les amendes envoyés avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'envoi des emails de rappel.", error: error.message });
  }
});

export default router;
