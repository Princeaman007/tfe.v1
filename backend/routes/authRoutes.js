import express from "express";
import {
  register,
  verifyEmail,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyToken } from "../controllers/authController.js"; 

const router = express.Router();

// ✅ Inscription (Enregistrement)
router.post("/register", register);

// ✅ Vérification de l'email
router.get("/verify-email/:token", verifyEmail);

// ✅ Connexion (Login) - Stocke le JWT dans un cookie sécurisé
router.post("/login", login);

// ✅ Vérification du Token (Ajoute cette route si elle n'existe pas)
router.get("/verify", verifyToken);

// ✅ Récupérer le profil utilisateur (Protégé)
router.get("/profile", protect, getProfile);

// ✅ Mot de passe oublié
router.post("/forgot-password", forgotPassword);

// ✅ Réinitialisation du mot de passe
router.post("/reset-password/:token", resetPassword);

// ✅ Déconnexion (Efface le cookie du token)
router.post("/logout", logout);

export default router;
