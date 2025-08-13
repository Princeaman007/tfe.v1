import { body, param } from 'express-validator';

// Validateur pour la création d'un livre
export const validateCreateBook = [
  body('title')
    .notEmpty()
    .withMessage('Le titre est obligatoire')
    .isLength({ min: 1, max: 200 })
    .withMessage('Le titre doit contenir entre 1 et 200 caractères')
    .trim(),

  body('author')
    .notEmpty()
    .withMessage('L\'auteur est obligatoire')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom de l\'auteur doit contenir entre 1 et 100 caractères')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères')
    .trim(),

  body('genre')
    .notEmpty()
    .withMessage('Le genre est obligatoire')
    .isLength({ min: 1, max: 50 })
    .withMessage('Le genre doit contenir entre 1 et 50 caractères')
    .trim(),

  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`),

  body('coverImage')
    .optional()
    .isURL()
    .withMessage('L\'URL de l\'image de couverture doit être valide'),

  body('price')
    .notEmpty()
    .withMessage('Le prix est obligatoire')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),

  body('availableCopies')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le nombre de copies disponibles doit être un entier positif ou nul'),

  // ✅ CORRECTION: Permettre que ces champs soient absents ou vides à la création
  // Ils seront initialisés par défaut dans le contrôleur
  body('borrowedCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le nombre d\'emprunts doit être un entier positif'),

  body('returnedCount')
    .optional()  
    .isInt({ min: 0 })
    .withMessage('Le nombre de retours doit être un entier positif'),

  body('likes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Les likes doivent être un entier positif')
];

// Validateur pour la mise à jour d'un livre
export const validateUpdateBook = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Le titre doit contenir entre 1 et 200 caractères')
    .trim(),

  body('author')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom de l\'auteur doit contenir entre 1 et 100 caractères')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères')
    .trim(),

  body('genre')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Le genre doit contenir entre 1 et 50 caractères')
    .trim(),

  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`),

  body('coverImage')
    .optional()
    .isURL()
    .withMessage('L\'URL de l\'image de couverture doit être valide'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),

  body('availableCopies')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le nombre de copies disponibles doit être un entier positif ou nul'),

  // ✅ Pour la mise à jour, interdire la modification des stats
  body('borrowedCount')
    .not().exists()
    .withMessage('Le nombre d\'emprunts ne peut pas être modifié manuellement'),

  body('returnedCount')
    .not().exists()
    .withMessage('Le nombre de retours ne peut pas être modifié manuellement'),

  body('likes')
    .not().exists()
    .withMessage('Les likes ne peuvent pas être modifiés manuellement')
];

// Validateur pour les paramètres d'ID
export const validateBookIdParam = [
  param("id")
    .notEmpty()
    .withMessage("L'ID du livre est requis")
    .customSanitizer(v => String(v ?? "").trim())
    .isMongoId()
    .withMessage("ID invalide"),
];

// Validateur pour la recherche/filtrage
export const validateBookSearch = [
  body('genre')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Le genre doit contenir entre 1 et 50 caractères')
    .trim(),

  body('author')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom de l\'auteur doit contenir entre 1 et 100 caractères')
    .trim(),

  body('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix minimum doit être un nombre positif'),

  body('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être un nombre positif'),

  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`)
];