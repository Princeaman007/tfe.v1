// validators/reviewValidator.js
import { param, body, query, oneOf } from "express-validator";

// ——— Helpers ———
const idParam = (name, label) => [
  param(name)
    .customSanitizer(v => String(v ?? "").trim())
    .notEmpty().withMessage(`${label} est obligatoire`).bail()
    .isMongoId().withMessage(`${label} doit être un ObjectId MongoDB valide`),
];

// ——— Create ———
export const validateCreateReview = [
  body("bookId")
    .customSanitizer(v => String(v ?? "").trim())
    .notEmpty().withMessage("bookId est requis").bail()
    .isMongoId().withMessage("bookId doit être un ObjectId MongoDB valide"),

  body("rating")
    .notEmpty().withMessage("rating est requis").bail()
    .isInt({ min: 1, max: 5 }).withMessage("rating doit être entre 1 et 5")
    .toInt(),

  body("comment")
    .isString().withMessage("comment doit être une chaîne")
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage("comment doit faire entre 10 et 1000 caractères"),
];

// ——— Update ———
export const validateReviewIdParam = idParam("reviewId", "ID d'avis");

export const validateUpdateReview = [
  oneOf(
    [ body("rating").exists(), body("comment").exists() ],
    "Fournissez au moins 'rating' ou 'comment'"
  ),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("La note doit être un entier entre 1 et 5")
    .toInt(),

  body("comment")
    .optional({ checkFalsy: true })
    .isString().withMessage("Le commentaire doit être une chaîne")
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage("Le commentaire doit contenir entre 10 et 1000 caractères"),

  // champs non modifiables
  body("user").not().exists().withMessage("L'utilisateur ne peut pas être modifié"),
  body("userId").not().exists().withMessage("userId ne peut pas être modifié"),
  body("book").not().exists().withMessage("Le livre ne peut pas être modifié"),
  body("bookId").not().exists().withMessage("bookId ne peut pas être modifié"),
];

// ——— Stats par livre (param) ———
export const validateReviewStats = idParam("bookId", "L'ID du livre");

// ——— Recherche/filtrage (GET /reviews?...) ———
export const validateReviewSearch = [
  query("user").optional().isMongoId().withMessage("user doit être un ObjectId MongoDB valide"),
  query("book").optional().isMongoId().withMessage("book doit être un ObjectId MongoDB valide"),

  query("rating").optional().isInt({ min: 1, max: 5 }).withMessage("rating doit être entre 1 et 5").toInt(),
  query("minRating").optional().isInt({ min: 1, max: 5 }).withMessage("minRating doit être entre 1 et 5").toInt(),
  query("maxRating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("maxRating doit être entre 1 et 5")
    .toInt()
    .custom((value, { req }) => {
      if (req.query.minRating && Number(value) < Number(req.query.minRating)) {
        throw new Error("maxRating doit être ≥ minRating");
      }
      return true;
    }),

  query("startDate").optional().isISO8601().withMessage("startDate doit être ISO8601").toDate(),
  query("endDate")
    .optional()
    .isISO8601().withMessage("endDate doit être ISO8601")
    .toDate()
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error("endDate doit être postérieure à startDate");
      }
      return true;
    }),
];

// ——— Pagination (GET) ———
export const validateReviewPagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("page doit être ≥ 1").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit doit être 1..100").toInt(),
  query("sortBy").optional().isIn(["rating", "createdAt", "helpful"]).withMessage("sortBy invalide"),
  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("sortOrder doit être 'asc' ou 'desc'"),
];

// ——— Modération (admin) ———
export const validateModerateReview = [
  body("status").optional().isIn(["approved", "rejected", "pending"]).withMessage('status doit être "approved", "rejected" ou "pending"'),
  body("moderationNote").optional().isLength({ max: 500 }).withMessage("moderationNote ≤ 500").trim(),
];

// ——— Signalement ———
export const validateReportReview = [
  body("reason")
    .notEmpty().withMessage("reason est obligatoire").bail()
    .isIn(["spam", "inappropriate", "offensive", "fake", "other"])
    .withMessage('reason doit être: spam, inappropriate, offensive, fake ou other'),
  body("description").optional().isLength({ max: 500 }).withMessage("description ≤ 500").trim(),
];

// ——— Permission (évite user dans le body) ———
export const validateReviewPermission = [
  body("book")
    .notEmpty().withMessage("book est obligatoire").bail()
    .isMongoId().withMessage("book doit être un ObjectId MongoDB valide"),
  // l'utilisateur provient de req.user (protect), pas du body
];
