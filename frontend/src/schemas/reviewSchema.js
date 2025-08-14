// src/schemas/reviewSchema.js
import { z } from 'zod';

// Schéma de base pour ObjectId MongoDB
const mongoIdSchema = z
  .string()
  .min(1, "ID obligatoire")
  .regex(/^[0-9a-fA-F]{24}$/, "ID doit être un ObjectId MongoDB valide");

// === SCHÉMAS POUR CRÉATION DE REVIEW ===
export const createReviewSchema = z.object({
  bookId: mongoIdSchema.refine(
    (id) => id.trim().length > 0,
    { message: "bookId est requis" }
  ),
  
  rating: z
    .coerce
    .number()
    .int("La note doit être un nombre entier")
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5"),
    
  comment: z
    .string()
    .trim()
    .min(10, "Le commentaire doit faire entre 10 et 1000 caractères")
    .max(1000, "Le commentaire doit faire entre 10 et 1000 caractères")
});

// === SCHÉMAS POUR MODIFICATION DE REVIEW ===
export const updateReviewSchema = z.object({
  rating: z
    .coerce
    .number()
    .int("La note doit être un entier")
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5")
    .optional(),
    
  comment: z
    .string()
    .trim()
    .min(10, "Le commentaire doit contenir entre 10 et 1000 caractères")
    .max(1000, "Le commentaire doit contenir entre 10 et 1000 caractères")
    .optional()
}).refine(
  (data) => data.rating !== undefined || data.comment !== undefined,
  {
    message: "Fournissez au moins la note ou le commentaire",
    path: ["root"]
  }
);

// === SCHÉMAS POUR RECHERCHE/FILTRAGE ===
export const reviewSearchSchema = z.object({
  user: mongoIdSchema.optional(),
  book: mongoIdSchema.optional(),
  
  rating: z
    .coerce
    .number()
    .int()
    .min(1, "rating doit être entre 1 et 5")
    .max(5, "rating doit être entre 1 et 5")
    .optional(),
    
  minRating: z
    .coerce
    .number()
    .int()
    .min(1, "minRating doit être entre 1 et 5")
    .max(5, "minRating doit être entre 1 et 5")
    .optional(),
    
  maxRating: z
    .coerce
    .number()
    .int()
    .min(1, "maxRating doit être entre 1 et 5")
    .max(5, "maxRating doit être entre 1 et 5")
    .optional(),
    
  startDate: z
    .string()
    .datetime("startDate doit être au format ISO8601")
    .optional(),
    
  endDate: z
    .string()
    .datetime("endDate doit être au format ISO8601")
    .optional()
}).refine(
  (data) => {
    if (data.minRating && data.maxRating) {
      return data.maxRating >= data.minRating;
    }
    return true;
  },
  {
    message: "maxRating doit être supérieur ou égal à minRating",
    path: ["maxRating"]
  }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "endDate doit être postérieure à startDate",
    path: ["endDate"]
  }
);

// === SCHÉMAS POUR PAGINATION ===
export const reviewPaginationSchema = z.object({
  page: z
    .coerce
    .number()
    .int("Le numéro de page doit être un entier")
    .min(1, "page doit être supérieur ou égal à 1")
    .optional()
    .default(1),
    
  limit: z
    .coerce
    .number()
    .int("La limite doit être un entier")
    .min(1, "limit doit être entre 1 et 100")
    .max(100, "limit doit être entre 1 et 100")
    .optional()
    .default(10),
    
  sortBy: z
    .enum(["rating", "createdAt", "helpful"], 
          { message: "sortBy doit être: rating, createdAt ou helpful" })
    .optional()
    .default("createdAt"),
    
  sortOrder: z
    .enum(["asc", "desc"], { message: "sortOrder doit être 'asc' ou 'desc'" })
    .optional()
    .default("desc")
});

// === SCHÉMAS POUR MODÉRATION (ADMIN) ===
export const moderateReviewSchema = z.object({
  status: z
    .enum(["approved", "rejected", "pending"], 
          { message: 'status doit être "approved", "rejected" ou "pending"' })
    .optional(),
    
  moderationNote: z
    .string()
    .max(500, "moderationNote ne peut pas dépasser 500 caractères")
    .trim()
    .optional()
});

// === SCHÉMAS POUR SIGNALEMENT ===
export const reportReviewSchema = z.object({
  reason: z
    .enum(["spam", "inappropriate", "offensive", "fake", "other"], 
          { message: "reason doit être: spam, inappropriate, offensive, fake ou other" }),
    
  description: z
    .string()
    .max(500, "description ne peut pas dépasser 500 caractères")
    .trim()
    .optional()
});

// === SCHÉMAS POUR PERMISSIONS ===
export const reviewPermissionSchema = z.object({
  book: mongoIdSchema.refine(
    (id) => id.trim().length > 0,
    { message: "book est obligatoire" }
  )
  // L'utilisateur provient de req.user, pas du body
});

// === SCHÉMA POUR NOTATION RAPIDE ===
export const quickRatingSchema = z.object({
  bookId: mongoIdSchema,
  rating: z
    .coerce
    .number()
    .int("La note doit être un nombre entier")
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5")
});

// === SCHÉMA POUR REVIEW AVEC COMMENTAIRE OPTIONNEL ===
export const flexibleReviewSchema = z.object({
  bookId: mongoIdSchema,
  rating: z
    .coerce
    .number()
    .int("La note doit être un nombre entier")
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5"),
    
  comment: z
    .string()
    .trim()
    .min(10, "Le commentaire doit faire au moins 10 caractères")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères")
    .optional()
    .or(z.literal(""))
});

