import express from "express";
import { deleteUser, getAllUsers } from "../controllers/userController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Récupérer tous les utilisateurs (Superadmin uniquement)
router.get("/", protect, isSuperAdmin, getAllUsers);

// 🔹 Supprimer un utilisateur (Superadmin uniquement)
router.delete("/:id", protect, isSuperAdmin, deleteUser);

export default router;
