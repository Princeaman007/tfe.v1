import express from "express";
import {
  register,
  verifyEmail,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  logout,
  verifyToken,
  refreshToken 
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


import { 
  validateRegisterUser,
  validateLoginUser,
  validateResetPassword,
  validateConfirmResetPassword,
  validateEmailVerification
} from '../validators/userValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// ✅ Inscription (Enregistrement)
router.post("/register", 
  validateRegisterUser, 
  handleValidationErrors, 
  register
);

// ✅ Vérification de l'email
// AJOUT: Validation du token de vérification
router.get("/verify-email/:token", 
  validateEmailVerification,
  handleValidationErrors,
  verifyEmail
);

// ✅ Connexion (Login) - Stocke le JWT dans un cookie sécurisé
router.post("/login", 
  validateLoginUser, 
  handleValidationErrors, 
  login
);

// ✅ Vérification du Token (middleware de vérification)
router.get("/verify", verifyToken);

// ✅ NOUVEAU: Rafraîchissement du token
router.post("/refresh-token", protect, refreshToken);

// ✅ Récupérer le profil utilisateur (Protégé)
router.get("/profile", 
  protect, 
  getProfile
);

// ✅ Mot de passe oublié
// AJOUT: Validation de l'email pour reset
router.post("/forgot-password", 
  validateResetPassword,
  handleValidationErrors,
  forgotPassword
);

// ✅ Réinitialisation du mot de passe
// AJOUT: Validation du token et nouveau mot de passe
router.put("/reset-password/:token", 
  validateConfirmResetPassword,
  handleValidationErrors,
  resetPassword
);

// ✅ Déconnexion (Efface le cookie du token)
// Pas de validation nécessaire pour logout
router.post("/logout", logout);

export default router;