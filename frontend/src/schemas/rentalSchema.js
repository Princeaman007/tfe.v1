// src/schemas/rentalSchema.js
import { z } from 'zod'; // ✅ Import manquant ajouté

// Schéma de base pour ObjectId MongoDB
const mongoIdSchema = z
  .string()
  .min(1, "ID obligatoire")
  .regex(/^[0-9a-fA-F]{24}$/, "ID doit être un ObjectId MongoDB valide");

// ✅ Helper pour valider les dates datetime-local
const datetimeLocalSchema = z
  .string()
  .min(1, "Date requise")
  .refine(
    (val) => {
      // Accepter les formats datetime-local (YYYY-MM-DDTHH:MM) et ISO8601
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: "Format de date invalide" }
  );

// === SCHÉMAS POUR CRÉATION DE LOCATION ===
export const createRentalSchema = z.object({
  user: mongoIdSchema.refine(
    (id) => id.trim().length > 0,
    { message: "L'utilisateur est obligatoire" }
  ),
  
  book: mongoIdSchema.refine(
    (id) => id.trim().length > 0,
    { message: "Le livre est obligatoire" }
  ),

  stripeSessionId: z
    .string()
    .min(1, "L'ID de session Stripe doit contenir entre 1 et 200 caractères")
    .max(200, "L'ID de session Stripe doit contenir entre 1 et 200 caractères")
    .trim()
    .optional(),

  dueDate: z
    .string()
    .datetime("La date d'échéance doit être au format ISO8601 valide")
    .refine(
      (date) => new Date(date) > new Date(),
      { message: "La date d'échéance doit être dans le futur" }
    )
    .optional()
});

// === SCHÉMAS POUR MISE À JOUR DE LOCATION ===
export const updateRentalSchema = z.object({
  returnedAt: z
    .string()
    .datetime("La date de retour doit être au format ISO8601 valide")
    .refine(
      (date) => new Date(date) <= new Date(),
      { message: "La date de retour ne peut pas être dans le futur" }
    )
    .optional(),

  status: z
    .enum(["borrowed", "returned"], 
          { message: "Le statut doit être \"borrowed\" ou \"returned\"" })
    .optional(),

  overdue: z
    .boolean()
    .optional(),

  fineAmount: z
    .coerce
    .number()
    .min(0, "Le montant de l'amende doit être un nombre positif ou nul")
    .optional(),

  finePaid: z
    .boolean()
    .optional(),

  dueDate: z
    .string()
    .datetime("La date d'échéance doit être au format ISO8601 valide")
    .optional()
});

// ✅ SCHÉMA POUR RETOUR DE LIVRE (corrigé pour datetime-local)
export const returnBookSchema = z.object({
  returnedAt: datetimeLocalSchema
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date <= new Date();
      },
      { message: "La date de retour ne peut pas être dans le futur" }
    )
    .transform((val) => val ? new Date(val).toISOString() : new Date().toISOString()),

  fineAmount: z
    .union([
      z.string().transform((val) => parseFloat(val) || 0),
      z.number()
    ])
    .pipe(z.number().min(0, "Le montant de l'amende doit être positif ou nul"))
    .optional()
});

// === SCHÉMAS POUR PAIEMENT D'AMENDE ===
export const payFineSchema = z.object({
  stripeSessionId: z
    .string()
    .min(1, "L'ID de session Stripe doit contenir entre 1 et 200 caractères")
    .max(200, "L'ID de session Stripe doit contenir entre 1 et 200 caractères")
    .trim()
    .optional(),

  finePaid: z
    .boolean()
    .optional()
});

// ✅ SCHÉMA POUR RECHERCHE/FILTRAGE (corrigé)
export const rentalSearchSchema = z.object({
  user: mongoIdSchema.optional(),
  book: mongoIdSchema.optional(),

  status: z
    .enum(["borrowed", "returned", ""], 
          { message: "Le statut doit être \"borrowed\", \"returned\" ou vide" })
    .optional(),

  overdue: z
    .enum(["true", "false", ""])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),

  startDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return !isNaN(new Date(val).getTime());
      },
      { message: "Format de date invalide" }
    )
    .transform((val) => val ? new Date(val).toISOString() : undefined),

  endDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return !isNaN(new Date(val).getTime());
      },
      { message: "Format de date invalide" }
    )
    .transform((val) => val ? new Date(val).toISOString() : undefined),

  finePaid: z
    .boolean()
    .optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
  }
);

// ✅ SCHÉMA POUR EXTENSION DE DATE (corrigé pour datetime-local)
export const extendDueDateSchema = z.object({
  newDueDate: datetimeLocalSchema
    .refine(
      (val) => {
        const date = new Date(val);
        const now = new Date();
        return date > now;
      },
      { message: "La nouvelle date d'échéance doit être dans le futur" }
    )
    .refine(
      (val) => {
        const date = new Date(val);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1); // Maximum 1 an
        return date <= maxDate;
      },
      { message: "L'extension ne peut pas dépasser 1 an" }
    )
    .transform((val) => new Date(val).toISOString())
});

// === SCHÉMAS POUR PAGINATION ===
export const rentalPaginationSchema = z.object({
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
    .enum(["borrowedAt", "dueDate", "returnedAt", "status"], 
          { message: "sortBy doit être: borrowedAt, dueDate, returnedAt ou status" })
    .optional()
    .default("borrowedAt"),

  sortOrder: z
    .enum(["asc", "desc"], { message: "sortOrder doit être 'asc' ou 'desc'" })
    .optional()
    .default("desc")
});

// === SCHÉMAS POUR LOCATION RAPIDE ===
export const quickRentalSchema = z.object({
  bookId: mongoIdSchema,
  
  duration: z
    .coerce
    .number()
    .int("La durée doit être un nombre entier")
    .min(1, "La durée doit être d'au moins 1 jour")
    .max(30, "La durée ne peut pas dépasser 30 jours")
    .optional()
    .default(14)
});

// === SCHÉMAS POUR RENOUVELLEMENT ===
export const renewRentalSchema = z.object({
  rentalId: mongoIdSchema,
  
  extensionDays: z
    .coerce
    .number()
    .int("Le nombre de jours doit être un entier")
    .min(1, "L'extension doit être d'au moins 1 jour")
    .max(14, "L'extension ne peut pas dépasser 14 jours")
    .optional()
    .default(7)
});

// === SCHÉMAS POUR CALCUL D'AMENDE ===
export const calculateFineSchema = z.object({
  rentalId: mongoIdSchema,
  
  returnDate: z
    .string()
    .datetime("La date de retour doit être au format ISO8601 valide")
    .optional()
    .default(() => new Date().toISOString()),

  finePerDay: z
    .coerce
    .number()
    .min(0, "L'amende par jour doit être positive")
    .optional()
    .default(1.5)
});

// === SCHÉMAS POUR RAPPORT DE PROBLÈME ===
export const reportIssueSchema = z.object({
  rentalId: mongoIdSchema,
  
  issueType: z
    .enum(["damaged", "lost", "incomplete", "other"], 
          { message: "Type de problème: damaged, lost, incomplete ou other" }),

  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .trim(),

  reportedAt: z
    .string()
    .datetime("La date de signalement doit être au format ISO8601 valide")
    .optional()
    .default(() => new Date().toISOString())
});

// === SCHÉMAS POUR HISTORIQUE ===
export const rentalHistorySchema = z.object({
  userId: mongoIdSchema.optional(),
  
  startDate: z
    .string()
    .datetime("La date de début doit être au format ISO8601 valide")
    .optional(),

  endDate: z
    .string()
    .datetime("La date de fin doit être au format ISO8601 valide")
    .optional(),

  includeReturned: z
    .boolean()
    .optional()
    .default(true),

  includeFines: z
    .boolean()
    .optional()
    .default(true)
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
  }
);