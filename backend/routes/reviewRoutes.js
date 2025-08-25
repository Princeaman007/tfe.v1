import express from "express";
import { 
  addReview, 
  getReviewsForBook, 
  getMyReviews, 
  deleteReview, 
  updateReview 
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import {

  
  validateCreateReview,
  validateUpdateReview,
  validateReviewSearch,
  validateReviewPermission,
  validateReportReview,
  validateReviewStats,
  validateReviewPagination,
  validateReviewIdParam
} from '../validators/reviewValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

//  Middleware pour vérifier si c'est admin/superAdmin
const isAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin" || role === "superAdmin") {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: "Accès refusé : rôle admin ou superAdmin requis." 
  });
};

//  Routes principales

//  Ajouter un avis (utilisateur connecté)
router.post(
  "/",
  protect,
  validateCreateReview,   
  handleValidationErrors, 
  addReview
);

// Mes avis (avec filtres et pagination optionnels)
router.get("/me", 
  protect,
  validateReviewSearch,
  validateReviewPagination,
  handleValidationErrors,
  getMyReviews
);

//  Modifier mon avis
router.put(
  "/:reviewId",
  protect,
  validateReviewIdParam,
  validateUpdateReview,
  handleValidationErrors,
  updateReview
);

// Supprimer mon avis
router.delete("/:reviewId", 
  protect,
  validateReviewIdParam,
  handleValidationErrors,
  deleteReview
);

//  Avis d'un livre spécifique (public avec pagination)
router.get("/:bookId", 
  validateReviewStats, 
  validateReviewPagination,
  handleValidationErrors,
  getReviewsForBook
);

//  Routes administratives

//  Tous les avis (admin seulement)
router.get("/admin/all", 
  protect,
  isAdminOrSuperAdmin,
  validateReviewSearch,
  validateReviewPagination,
  handleValidationErrors,
  async (req, res) => {
    try {
      
      
      res.status(200).json({
        success: true,
        message: "Fonctionnalité à implémenter dans le controller",
        data: []
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

// Signaler un avis inapproprié
router.post("/:reviewId/report", 
  protect,
  validateReviewIdParam,
  validateReportReview,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { reason, description } = req.body;
      const reviewId = req.params.reviewId;
      
     
      
      res.status(200).json({
        success: true,
        message: "Avis signalé avec succès",
        data: {
          reviewId,
          reason,
          reportedBy: req.user._id
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors du signalement",
        error: error.message
      });
    }
  }
);

//  Statistiques d'avis par livre (public ou admin)
router.get("/stats/:bookId", 
  validateReviewStats,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bookId } = req.params;
      
      
      const stats = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      };
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors du calcul des statistiques",
        error: error.message
      });
    }
  }
);

//  Modérer un avis (admin seulement)
router.put("/:reviewId/moderate", 
  protect,
  isAdminOrSuperAdmin,
  validateReviewIdParam,
  async (req, res) => {
    try {
      const { action, reason } = req.body; 
      const reviewId = req.params.reviewId;
      
      // Logique de modération à implémenter
      
      res.status(200).json({
        success: true,
        message: `Avis ${action} avec succès`,
        data: {
          reviewId,
          action,
          moderatedBy: req.user._id,
          reason
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modération",
        error: error.message
      });
    }
  }
);

// Vérifier si l'utilisateur peut laisser un avis
router.post("/can-review", 
  protect,
  validateReviewPermission,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bookId } = req.body;
      const userId = req.user._id;
      
     
      
      const canReview = true; 
      
      res.status(200).json({
        success: true,
        canReview,
        message: canReview ? "Vous pouvez laisser un avis" : "Vous ne pouvez pas laisser d'avis pour ce livre"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification",
        error: error.message
      });
    }
  }
);

export default router;