import { body, param } from 'express-validator';

// Validateur pour la création d'une location
export const validateCreateRental = [
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

  body('stripeSessionId')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('L\'ID de session Stripe doit contenir entre 1 et 200 caractères')
    .trim(),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La date d\'échéance doit être au format ISO8601 valide')
    .custom((value) => {
      const dueDate = new Date(value);
      const now = new Date();
      if (dueDate <= now) {
        throw new Error('La date d\'échéance doit être dans le futur');
      }
      return true;
    }),

  // Les champs automatiques ne doivent pas être définis manuellement
  body('borrowedAt')
    .not().exists()
    .withMessage('La date d\'emprunt est définie automatiquement'),

  body('returnedAt')
    .not().exists()
    .withMessage('La date de retour ne peut pas être définie à la création'),

  body('status')
    .not().exists()
    .withMessage('Le statut est défini automatiquement à "borrowed"'),

  body('overdue')
    .not().exists()
    .withMessage('Le statut de retard est calculé automatiquement'),

  body('fineAmount')
    .not().exists()
    .withMessage('Le montant de l\'amende est calculé automatiquement'),

  body('finePaid')
    .not().exists()
    .withMessage('Le statut de paiement de l\'amende est défini automatiquement')
];

// Validateur pour la mise à jour d'une location (retour, amendes, etc.)
export const validateUpdateRental = [
  body('returnedAt')
    .optional()
    .isISO8601()
    .withMessage('La date de retour doit être au format ISO8601 valide')
    .custom((value, { req }) => {
      const returnedAt = new Date(value);
      const now = new Date();
      if (returnedAt > now) {
        throw new Error('La date de retour ne peut pas être dans le futur');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['borrowed', 'returned'])
    .withMessage('Le statut doit être "borrowed" ou "returned"'),

  body('overdue')
    .optional()
    .isBoolean()
    .withMessage('Le statut de retard doit être un booléen'),

  body('fineAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le montant de l\'amende doit être un nombre positif ou nul'),

  body('finePaid')
    .optional()
    .isBoolean()
    .withMessage('Le statut de paiement de l\'amende doit être un booléen'),

  // Champs qui ne peuvent pas être modifiés après création
  body('user')
    .not().exists()
    .withMessage('L\'utilisateur ne peut pas être modifié'),

  body('book')
    .not().exists()
    .withMessage('Le livre ne peut pas être modifié'),

  body('borrowedAt')
    .not().exists()
    .withMessage('La date d\'emprunt ne peut pas être modifiée'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La date d\'échéance doit être au format ISO8601 valide')
];

// Validateur pour le retour d'un livre
export const validateReturnBook = [
  body('returnedAt')
    .optional()
    .isISO8601()
    .withMessage('La date de retour doit être au format ISO8601 valide')
    .default(() => new Date().toISOString()),

  body('fineAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le montant de l\'amende doit être un nombre positif ou nul')
];

// Validateur pour le paiement d'une amende
export const validatePayFine = [
  body('stripeSessionId')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('L\'ID de session Stripe doit contenir entre 1 et 200 caractères')
    .trim(),

  body('finePaid')
    .optional()
    .isBoolean()
    .withMessage('Le statut de paiement doit être un booléen')
];

// Validateur pour les paramètres d'URL (ID de location)
export const validateRentalId = [
  param('id')
    .notEmpty()
    .withMessage('L\'ID de la location est obligatoire')
    .isMongoId()
    .withMessage('L\'ID de la location doit être un ObjectId MongoDB valide')
];

// Validateur pour la recherche/filtrage des locations
export const validateRentalSearch = [
  body('user')
    .optional()
    .isMongoId()
    .withMessage('L\'ID de l\'utilisateur doit être un ObjectId MongoDB valide'),

  body('book')
    .optional()
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide'),

  body('status')
    .optional()
    .isIn(['borrowed', 'returned'])
    .withMessage('Le statut doit être "borrowed" ou "returned"'),

  body('overdue')
    .optional()
    .isBoolean()
    .withMessage('Le statut de retard doit être un booléen'),

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
    }),

  body('finePaid')
    .optional()
    .isBoolean()
    .withMessage('Le statut de paiement de l\'amende doit être un booléen')
];

// Validateur pour l'extension de la date d'échéance
export const validateExtendDueDate = [
  body('newDueDate')
    .notEmpty()
    .withMessage('La nouvelle date d\'échéance est obligatoire')
    .isISO8601()
    .withMessage('La nouvelle date d\'échéance doit être au format ISO8601 valide')
    .custom((value, { req }) => {
      const newDueDate = new Date(value);
      const now = new Date();
      if (newDueDate <= now) {
        throw new Error('La nouvelle date d\'échéance doit être dans le futur');
      }
      return true;
    })
];