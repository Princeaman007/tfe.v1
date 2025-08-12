import { body } from 'express-validator';

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
    .withMessage('Le nombre de copies disponibles doit être un entier positif ou nul')
    .default(1),

  // Les champs statistiques ne doivent pas être modifiables à la création
  body('borrowedCount')
    .not().exists()
    .withMessage('Le nombre d\'emprunts ne peut pas être défini manuellement'),

  body('returnedCount')
    .not().exists()
    .withMessage('Le nombre de retours ne peut pas être défini manuellement'),

  body('likes')
    .not().exists()
    .withMessage('Les likes ne peuvent pas être définis manuellement')
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

  // Les champs statistiques ne doivent pas être modifiables
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

// Validateur pour les actions spécifiques (comme aimer un livre)
export const validateBookId = [
  body('bookId')
    .notEmpty()
    .withMessage('L\'ID du livre est obligatoire')
    .isMongoId()
    .withMessage('L\'ID du livre doit être un ObjectId MongoDB valide')
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