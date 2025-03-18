import express from "express";
import { 
  deleteUser, 
  getAllUsers, 
  updateProfile, 
  changePassword
} from "../controllers/userController.js";
import { protect, isSuperAdmin, isVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ **Récupérer tous les utilisateurs (Superadmin uniquement)**
router.get("/", protect, isSuperAdmin, getAllUsers);

// ✅ **Mettre à jour le profil utilisateur (Utilisateur connecté et email vérifié)**
router.put("/update-profile", protect, isVerified, updateProfile);

// ✅ **Changer le mot de passe (Utilisateur connecté et email vérifié)**
router.put("/change-password", protect, isVerified, changePassword);

// ✅ **Supprimer un utilisateur (Superadmin uniquement)**
router.delete("/:id", protect, isSuperAdmin, deleteUser);

export default router;
