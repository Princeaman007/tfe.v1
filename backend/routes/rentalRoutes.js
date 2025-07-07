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
    sendFineNotification
} from "../controllers/rentalController.js";

import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";
import Rental from "../models/rentalModel.js";

const router = express.Router();

// 🔹 Routes protégées pour les utilisateurs connectés
router.post("/borrow", protect, borrowBook);   // ✅ Emprunter un livre
router.post("/return", protect, returnBookImproved);   // ✅ Retourner un livre (version améliorée)
router.get("/", protect, getUserRentals);      // ✅ Voir ses propres locations (simple)
router.get("/detailed", protect, getUserRentalsDetailed); // ✅ Voir ses locations avec détails

// 🔹 Gestion des locations (Superadmin uniquement)
router.get("/admin/all", protect, isSuperAdmin, getAllRentals);       // ✅ Voir toutes les locations
router.get("/admin/user/:userId", protect, isSuperAdmin, getUserRentalsByAdmin); // ✅ Voir les locations d'un utilisateur

// 🔹 Routes de gestion des retards (Superadmin uniquement)
router.get("/admin/overdue", protect, isSuperAdmin, async (req, res) => {
    try {
        const overdueRentals = await Rental.find({ overdue: true })
            .populate("user", "name email")
            .populate("book", "title author");
        res.status(200).json(overdueRentals);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// 🔹 Forcer la vérification des retards (Superadmin uniquement)
router.get("/admin/check-overdue", protect, isSuperAdmin, async (req, res) => {
    try {
        await checkOverdueRentals();
        res.status(200).json({ message: "Vérification des livres en retard effectuée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification des retards.", error: error.message });
    }
});

router.get("/admin/fines", protect, isSuperAdmin, async (req, res) => {
    try {
        const unpaidFines = await Rental.find({ fineAmount: { $gt: 0 }, finePaid: false })
            .populate("user", "name email")
            .populate("book", "title author");

        res.status(200).json(unpaidFines);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// 🔹 Forcer l'envoi des emails de rappel pour les amendes impayées (Admin uniquement)
router.get("/admin/send-fine-notifications", protect, isSuperAdmin, async (req, res) => {
    try {
        await sendFineNotification();
        res.status(200).json({ message: "Emails de rappel pour les amendes envoyés avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'envoi des emails de rappel.", error: error.message });
    }
});

export default router;