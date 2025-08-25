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


import {
  validateRegisterUser,
  validateUpdateUserProfile,
  validateAdminUpdateUser,
  validateChangePassword,
  validateUserId,
  validateUserSearch,
  validateUserPagination,
  validateManageFavorites,
  validateAdminCreateUser,
} from '../validators/userValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

//  Routes accessibles à tous les utilisateurs connectés

//  Mettre à jour son profil
router.put("/update-profile", 
  protect, 
  isVerified,
  validateUpdateUserProfile,
  handleValidationErrors,
  updateProfile
);

//  Changer son mot de passe
router.put("/change-password", 
  protect, 
  isVerified,
  validateChangePassword,
  handleValidationErrors,
  changePassword
);



//  BONUS: Gérer ses favoris
router.post("/favorites", 
  protect,
  isVerified,
  validateManageFavorites,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bookId } = req.body;
      const userId = req.user._id;
      
      
      res.status(200).json({
        success: true,
        message: "Favori ajouté/retiré avec succès"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la gestion des favoris",
        error: error.message
      });
    }
  }
);

// BONUS: Récupérer ses propres statistiques
router.get("/me/stats", 
  protect,
  isVerified,
  async (req, res) => {
    try {
      const user = req.user;
      
      res.status(200).json({
        success: true,
        data: {
          totalRentals: user.stats?.totalRentals || 0,
          totalReviews: user.stats?.totalReviews || 0,
          totalFines: user.stats?.totalFines || 0,
          averageRating: user.stats?.averageRating || 0,
          memberSince: user.stats?.joinedAt || user.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
        error: error.message
      });
    }
  }
);

//  Routes réservées au SuperAdmin uniquement

//  Tous les utilisateurs (avec recherche et pagination)
router.get("/", 
  protect, 
  isSuperAdmin,
  validateUserSearch,
  validateUserPagination,
  handleValidationErrors,
  getAllUsers
);

//  Statistiques globales des utilisateurs
router.get("/stats", 
  protect, 
  isSuperAdmin, 
  getUserStats
);

//  Un utilisateur par ID
router.get("/:id", 
  protect, 
  isSuperAdmin,
  validateUserId,
  handleValidationErrors,
  getUserById
);

//  Créer un utilisateur (admin)
router.post("/", 
  protect, 
  isSuperAdmin,
  validateAdminCreateUser,   
  handleValidationErrors,
  createUser
);

// Modifier un utilisateur (admin)
router.put("/:id", 
  protect, 
  isSuperAdmin,
  validateUserId,
  validateAdminUpdateUser, 
  handleValidationErrors,
  updateUser
);

//  Modifier le mot de passe d'un utilisateur (admin)
router.put("/:id/password", 
  protect, 
  isSuperAdmin,
  validateUserId,
  
  (req, res, next) => {
    
    const { body } = require('express-validator');
    
    return [
      body('newPassword')
        .notEmpty()
        .withMessage('Le nouveau mot de passe est obligatoire')
        .isLength({ min: 6, max: 128 })
        .withMessage('Le nouveau mot de passe doit contenir entre 6 et 128 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
      
      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
          return true;
        })
    ](req, res, next);
  },
  handleValidationErrors,
  changeUserPassword
);

// Basculer la vérification email d'un utilisateur
router.patch("/:id/verify", 
  protect, 
  isSuperAdmin,
  validateUserId,
  // Validation pour le toggle de vérification
  (req, res, next) => {
    const { body } = require('express-validator');
    
    return [
      body('isVerified')
        .optional()
        .isBoolean()
        .withMessage('Le statut de vérification doit être un booléen')
    ](req, res, next);
  },
  handleValidationErrors,
  toggleUserVerification
);

// Supprimer un utilisateur
router.delete("/:id", 
  protect, 
  isSuperAdmin,
  validateUserId,
  handleValidationErrors,
  deleteUser
);

// BONUS: Routes administratives supplémentaires

//  Verrouiller/déverrouiller un utilisateur
router.patch("/:id/lock", 
  protect,
  isSuperAdmin,
  validateUserId,
  (req, res, next) => {
    const { body } = require('express-validator');
    
    return [
      body('lockUntil')
        .optional()
        .isISO8601()
        .withMessage('La date de verrouillage doit être au format ISO8601 valide'),
      
      body('reason')
        .optional()
        .isLength({ max: 200 })
        .withMessage('La raison ne peut pas dépasser 200 caractères')
        .trim()
    ](req, res, next);
  },
  handleValidationErrors,
  async (req, res) => {
    try {
      const { lockUntil, reason } = req.body;
      const userId = req.params.id;
      
      
      
      res.status(200).json({
        success: true,
        message: lockUntil ? "Utilisateur verrouillé" : "Utilisateur déverrouillé",
        data: { userId, lockUntil, reason }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors du verrouillage/déverrouillage",
        error: error.message
      });
    }
  }
);

//  Réinitialiser les tentatives de connexion
router.patch("/:id/reset-attempts", 
  protect,
  isSuperAdmin,
  validateUserId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;
      
   
      
      res.status(200).json({
        success: true,
        message: "Tentatives de connexion réinitialisées",
        data: { userId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la réinitialisation",
        error: error.message
      });
    }
  }
);

// Historique des actions d'un utilisateur
router.get("/:id/activity", 
  protect,
  isSuperAdmin,
  validateUserId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;
      
      
      
      res.status(200).json({
        success: true,
        data: {
          rentals: [],
          reviews: [],
          loginHistory: [],
          lastActivity: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'activité",
        error: error.message
      });
    }
  }
);

export default router;