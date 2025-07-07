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
  changePassword
} from "../controllers/userController.js";
import { protect, isAdmin, issuperAdmin, isVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Routes pour les utilisateurs normaux (profil personnel)
router.put("/update-profile", protect, isVerified, updateProfile);
router.put("/change-password", protect, isVerified, changePassword);

// 🔹 Routes CRUD pour les administrateurs

// Récupérer tous les utilisateurs avec pagination et filtres (Admin/superAdmin)
router.get("/", protect, isAdmin, getAllUsers);

// Récupérer les statistiques des utilisateurs (Admin/superAdmin)
router.get("/stats", protect, isAdmin, getUserStats);

// Récupérer un utilisateur par ID (Admin/superAdmin)
router.get("/:id", protect, isAdmin, getUserById);

// Créer un nouvel utilisateur (Admin/superAdmin)
router.post("/", protect, isAdmin, createUser);

// Mettre à jour un utilisateur (Admin/superAdmin)
router.put("/:id", protect, isAdmin, updateUser);

// Changer le mot de passe d'un utilisateur (Admin/superAdmin)
router.put("/:id/password", protect, isAdmin, changeUserPassword);

// Basculer le statut de vérification d'un utilisateur (Admin/superAdmin)
router.patch("/:id/verify", protect, isAdmin, toggleUserVerification);

// Supprimer un utilisateur (superAdmin uniquement)
router.delete("/:id", protect, issuperAdmin, deleteUser);

export default router;