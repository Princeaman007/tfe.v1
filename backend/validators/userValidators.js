import { body, param } from 'express-validator';

// Validateur pour l'inscription d'un utilisateur
export const validateRegisterUser = [
  body('name')
    .notEmpty()
    .withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim()
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  body('email')
    .notEmpty()
    .withMessage('L\'email est obligatoire')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est obligatoire')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),

  body('phoneNumber')
    .optional()
    .matches(/^[+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Format de téléphone invalide'),

  // Champs qui ne doivent pas être définis à l'inscription
  body('role')
    .not().exists()
    .withMessage('Le rôle ne peut pas être défini lors de l\'inscription'),

  body('isVerified')
    .not().exists()
    .withMessage('Le statut de vérification est géré automatiquement'),

  body('isActive')
    .not().exists()
    .withMessage('Le statut actif est défini automatiquement')
];

// Validateur pour la connexion
export const validateLoginUser = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est obligatoire')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est obligatoire')
];

// Validateur pour la mise à jour du profil utilisateur
export const validateUpdateUserProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim()
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  body('phoneNumber')
    .optional()
    .matches(/^[+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Format de téléphone invalide'),

  body('profileImage')
    .optional()
    .isURL()
    .withMessage('L\'URL de l\'image de profil doit être valide'),

  // Validation de l'adresse
  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La rue ne peut pas dépasser 100 caractères')
    .trim(),

  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La ville ne peut pas dépasser 50 caractères')
    .trim()
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
    .withMessage('La ville ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  body('address.postalCode')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Le code postal doit contenir exactement 5 chiffres'),

  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Le pays ne peut pas dépasser 50 caractères')
    .trim(),

  // Validation des préférences
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Les notifications email doivent être un booléen'),

  body('preferences.smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('Les notifications SMS doivent être un booléen'),

  body('preferences.language')
    .optional()
    .isIn(['fr', 'en', 'es'])
    .withMessage('La langue doit être fr, en ou es'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Le thème doit être light ou dark'),

  // Champs protégés
  body('email')
    .not().exists()
    .withMessage('L\'email ne peut pas être modifié depuis ce endpoint'),

  body('password')
    .not().exists()
    .withMessage('Le mot de passe ne peut pas être modifié depuis ce endpoint'),

  body('role')
    .not().exists()
    .withMessage('Le rôle ne peut pas être modifié depuis ce endpoint'),

  body('isVerified')
    .not().exists()
    .withMessage('Le statut de vérification ne peut pas être modifié depuis ce endpoint'),

  body('stats')
    .not().exists()
    .withMessage('Les statistiques ne peuvent pas être modifiées manuellement')
];

// Validateur pour la gestion administrative des utilisateurs
export const validateAdminUpdateUser = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'superAdmin'])
    .withMessage('Le rôle doit être user, admin ou superAdmin'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('Le statut de vérification doit être un booléen'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères')
    .trim(),

  body('lockUntil')
    .optional()
    .isISO8601()
    .withMessage('La date de verrouillage doit être au format ISO8601 valide'),

  // Réinitialiser les tentatives de connexion
  body('resetLoginAttempts')
    .optional()
    .isBoolean()
    .withMessage('La réinitialisation des tentatives doit être un booléen')
];

// Validateur pour le changement de mot de passe
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est obligatoire'),

  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est obligatoire')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le nouveau mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  body('confirmNewPassword')
    .notEmpty()
    .withMessage('La confirmation du nouveau mot de passe est obligatoire')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas');
      }
      return true;
    })
];

// Validateur pour la réinitialisation de mot de passe
export const validateResetPassword = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est obligatoire')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
];

// Validateur pour confirmer la réinitialisation de mot de passe
export const validateConfirmResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Le token de réinitialisation est obligatoire')
    .isLength({ min: 32, max: 128 })
    .withMessage('Token de réinitialisation invalide'),

  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est obligatoire')
    .isLength({ min: 6, max: 128 })
    .withMessage('Le nouveau mot de passe doit contenir entre 6 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  body('confirmNewPassword')
    .notEmpty()
    .withMessage('La confirmation du nouveau mot de passe est obligatoire')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas');
      }
      return true;
    })
];

// Validateur pour ajouter/retirer des favoris
export const validateManageFavorites = [
  body('bookId')
    .notEmpty()
    .withMessage('L\'ID du livre est obligatoire')
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide')
];

// Validateur pour les paramètres d'URL (ID utilisateur)
export const validateUserId = [
  param('id')
    .notEmpty()
    .withMessage('L\'ID de l\'utilisateur est obligatoire')
    .isMongoId()
    .withMessage('L\'ID de l\'utilisateur doit être un ObjectId MongoDB valide')
];

// Validateur pour la recherche d'utilisateurs
export const validateUserSearch = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Le nom doit contenir entre 1 et 50 caractères')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Format d\'email invalide'),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'superAdmin'])
    .withMessage('Le rôle doit être user, admin ou superAdmin'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('Le statut de vérification doit être un booléen'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen'),

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

// Validateur pour la vérification d'email
export const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Le token de vérification est obligatoire')
    .isLength({ min: 32, max: 128 })
    .withMessage('Token de vérification invalide')
];

// Validateur pour la pagination
export const validateUserPagination = [
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
    .isIn(['name', 'email', 'createdAt', 'lastLoginAt', 'stats.totalRentals'])
    .withMessage('Le tri doit être par: name, email, createdAt, lastLoginAt ou stats.totalRentals'),

  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('L\'ordre de tri doit être "asc" ou "desc"')
];