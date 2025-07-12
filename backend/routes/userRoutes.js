import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  getUserStats,
  toggleUserVerification,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";

import {
  protect,
  isVerified,
  isSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Routes accessibles à tous les utilisateurs connectés
router.put("/update-profile", protect, isVerified, updateProfile);
router.put("/change-password", protect, isVerified, changePassword);

// 🔹 Routes réservées au SuperAdmin uniquement

router.get("/", protect, isSuperAdmin, getAllUsers);               // Tous les utilisateurs
router.get("/stats", protect, isSuperAdmin, getUserStats);         // Statistiques
router.get("/:id", protect, isSuperAdmin, getUserById);            // Un utilisateur par ID
router.post("/", protect, isSuperAdmin, createUser);               // Créer utilisateur
router.put("/:id", protect, isSuperAdmin, updateUser);             // Modifier utilisateur
router.put("/:id/password", protect, isSuperAdmin, changeUserPassword); // Modifier mot de passe
router.patch("/:id/verify", protect, isSuperAdmin, toggleUserVerification); // Vérification email
router.delete("/:id", protect, isSuperAdmin, deleteUser);          // Supprimer utilisateur

export default router;
