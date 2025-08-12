import { body, param } from 'express-validator';

// Validateur pour la création d'un avis
export const validateCreateReview = [
  body('user')
    .notEmpty()
    .withMessage('L\'utilisateur est obligatoire')
    .isMongoId()
    .withMessage('L\'ID de l\'utilisateur doit être un ObjectId MongoDB valide'),

  body('book')
    .notEmpty()
    .withMessage('Le livre est obligatoire')
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide'),

  body('rating')
    .notEmpty()
    .withMessage('La note est obligatoire')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être un entier entre 1 et 5'),

  body('comment')
    .notEmpty()
    .withMessage('Le commentaire est obligatoire')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le commentaire doit contenir entre 10 et 1000 caractères')
    .trim()
    .escape() // Protection contre XSS
];

// Validateur pour la mise à jour d'un avis
export const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être un entier entre 1 et 5'),

  body('comment')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le commentaire doit contenir entre 10 et 1000 caractères')
    .trim()
    .escape(), // Protection contre XSS

  // Les références ne peuvent pas être modifiées
  body('user')
    .not().exists()
    .withMessage('L\'utilisateur ne peut pas être modifié'),

  body('book')
    .not().exists()
    .withMessage('Le livre ne peut pas être modifié')
];

// Validateur pour les paramètres d'URL (ID d'avis)
export const validateReviewId = [
  param('id')
    .notEmpty()
    .withMessage('L\'ID de l\'avis est obligatoire')
    .isMongoId()
    .withMessage('L\'ID de l\'avis doit être un ObjectId MongoDB valide')
];

// Validateur pour la recherche/filtrage des avis
export const validateReviewSearch = [
  body('user')
    .optional()
    .isMongoId()
    .withMessage('L\'ID de l\'utilisateur doit être un ObjectId MongoDB valide'),

  body('book')
    .optional()
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être un entier entre 1 et 5'),

  body('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note minimum doit être un entier entre 1 et 5'),

  body('maxRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note maximum doit être un entier entre 1 et 5')
    .custom((value, { req }) => {
      if (req.body.minRating && parseInt(value) < parseInt(req.body.minRating)) {
        throw new Error('La note maximum doit être supérieure ou égale à la note minimum');
      }
      return true;
    }),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être au format ISO8601 valide'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être au format ISO8601 valide')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      return true;
    })
];

// Validateur pour vérifier qu'un utilisateur peut laisser un avis
export const validateReviewPermission = [
  body('user')
    .notEmpty()
    .withMessage('L\'utilisateur est obligatoire')
    .isMongoId()
    .withMessage('L\'ID de l\'utilisateur doit être un ObjectId MongoDB valide'),

  body('book')
    .notEmpty()
    .withMessage('Le livre est obligatoire')
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide')
];

// Validateur pour la modération des avis (admin)
export const validateModerateReview = [
  body('status')
    .optional()
    .isIn(['approved', 'rejected', 'pending'])
    .withMessage('Le statut doit être "approved", "rejected" ou "pending"'),

  body('moderationNote')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La note de modération ne peut pas dépasser 500 caractères')
    .trim()
];

// Validateur pour signaler un avis inapproprié
export const validateReportReview = [
  body('reason')
    .notEmpty()
    .withMessage('La raison du signalement est obligatoire')
    .isIn(['spam', 'inappropriate', 'offensive', 'fake', 'other'])
    .withMessage('La raison doit être: spam, inappropriate, offensive, fake ou other'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .trim()
];

// Validateur pour les statistiques d'avis par livre
export const validateReviewStats = [
  param('bookId')
    .notEmpty()
    .withMessage('L\'ID du livre est obligatoire')
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide')
];

// Validateur pour la pagination des avis
export const validateReviewPagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être un entier entre 1 et 100'),

  body('sortBy')
    .optional()
    .isIn(['rating', 'createdAt', 'helpful'])
    .withMessage('Le tri doit être par: rating, createdAt ou helpful'),

  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('L\'ordre de tri doit être "asc" ou "desc"')
];