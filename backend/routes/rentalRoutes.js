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

// ✅ AJOUT: Import des validateurs
import {
  validateCreateRental,
  validateUpdateRental,
  validateReturnBook,
  validateRentalId,
  validateRentalSearch,
  validateExtendDueDate
} from '../validators/rentalValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// ✅ Middleware : admin OU superAdmin
const isAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin" || role === "superAdmin") {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé : rôle admin ou superAdmin requis." });
};

// 🔹 Routes protégées pour les utilisateurs connectés

// ✅ Emprunter un livre
router.post("/borrow", 
  protect,
  validateCreateRental,
  handleValidationErrors,
  borrowBook
);

// ✅ Retourner un livre (version améliorée)
router.post("/return", 
  protect,
  validateReturnBook,
  handleValidationErrors,
  returnBookImproved
);

// ✅ Mes locations (avec filtres optionnels)
router.get("/", 
  protect,
  validateRentalSearch,
  handleValidationErrors,
  getUserRentals
);

// ✅ Mes locations détaillées
router.get("/detailed", 
  protect,
  validateRentalSearch,
  handleValidationErrors,
  getUserRentalsDetailed
);

// 🔹 Gestion des locations (admin ou superAdmin)

// ✅ Toutes les locations
router.get("/admin/all", 
  protect, 
  isAdminOrSuperAdmin,
  validateRentalSearch,
  handleValidationErrors,
  getAllRentals
);

// ✅ Locations d'un utilisateur spécifique
router.get("/admin/user/:userId", 
  protect, 
  isAdminOrSuperAdmin,
  validateRentalId,
  handleValidationErrors,
  getUserRentalsByAdmin
);

// ✅ Statistiques mensuelles
router.get("/admin/monthly", 
  protect, 
  isAdminOrSuperAdmin,
  getMonthlyRentals
);

// 🔹 Gestion des retards

// ✅ REFACTORISATION: Locations en retard
router.get("/admin/overdue", 
  protect, 
  isAdminOrSuperAdmin, 
  async (req, res) => {
    try {
      const overdueRentals = await Rental.find({ overdue: true })
        .populate("user", "name email")
        .populate("book", "title author");
      res.status(200).json({
        success: true,
        data: overdueRentals,
        count: overdueRentals.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Erreur serveur", 
        error: error.message 
      });
    }
  }
);

// ✅ REFACTORISATION: Vérifier les retards
router.post("/admin/check-overdue", 
  protect, 
  isAdminOrSuperAdmin, 
  async (req, res) => {
    try {
      await checkOverdueRentals();
      res.status(200).json({ 
        success: true,
        message: "Vérification des livres en retard effectuée avec succès." 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de la vérification des retards.", 
        error: error.message 
      });
    }
  }
);

// ✅ REFACTORISATION: Amendes impayées
router.get("/admin/fines", 
  protect, 
  isAdminOrSuperAdmin, 
  async (req, res) => {
    try {
      const unpaidFines = await Rental.find({ 
        fineAmount: { $gt: 0 }, 
        finePaid: false 
      })
        .populate("user", "name email")
        .populate("book", "title author");

      res.status(200).json({
        success: true,
        data: unpaidFines,
        totalAmount: unpaidFines.reduce((sum, rental) => sum + rental.fineAmount, 0),
        count: unpaidFines.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Erreur serveur", 
        error: error.message 
      });
    }
  }
);

// ✅ REFACTORISATION: Envoyer notifications d'amendes
router.post("/admin/send-fine-notifications", 
  protect, 
  isAdminOrSuperAdmin, 
  async (req, res) => {
    try {
      await sendFineNotification();
      res.status(200).json({ 
        success: true,
        message: "Emails de rappel pour les amendes envoyés avec succès." 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de l'envoi des emails de rappel.", 
        error: error.message 
      });
    }
  }
);

// 🔹 BONUS: Routes supplémentaires avec validation

// ✅ Prolonger la date d'échéance
router.put("/:id/extend", 
  protect,
  isAdminOrSuperAdmin,
  validateRentalId,
  validateExtendDueDate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { newDueDate } = req.body;
      const rental = await Rental.findByIdAndUpdate(
        req.params.id,
        { dueDate: newDueDate },
        { new: true }
      ).populate("user", "name email").populate("book", "title");

      if (!rental) {
        return res.status(404).json({
          success: false,
          message: "Location introuvable"
        });
      }

      res.status(200).json({
        success: true,
        message: "Date d'échéance prolongée avec succès",
        data: rental
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la prolongation",
        error: error.message
      });
    }
  }
);

// ✅ Mettre à jour une location (admin)
router.put("/:id", 
  protect,
  isAdminOrSuperAdmin,
  validateRentalId,
  validateUpdateRental,
  handleValidationErrors,
  async (req, res) => {
    try {
      const rental = await Rental.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate("user", "name email").populate("book", "title");

      if (!rental) {
        return res.status(404).json({
          success: false,
          message: "Location introuvable"
        });
      }

      res.status(200).json({
        success: true,
        message: "Location mise à jour avec succès",
        data: rental
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour",
        error: error.message
      });
    }
  }
);

export default router;