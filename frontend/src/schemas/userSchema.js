// src/schemas/userSchema.js
import { z } from 'zod';

// Schéma de base pour le nom
const nameSchema = z
  .string()
  .min(2, "Le nom doit contenir entre 2 et 50 caractères")
  .max(50, "Le nom doit contenir entre 2 et 50 caractères")
  .trim()
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes");

// Schéma de base pour l'email
const emailSchema = z
  .string()
  .email("Format d'email invalide")
  .max(100, "L'email ne peut pas dépasser 100 caractères")
  .transform(email => email.toLowerCase().trim());

// Schéma de base pour le mot de passe
const passwordSchema = z
  .string()
  .min(6, "Le mot de passe doit contenir entre 6 et 128 caractères")
  .max(128, "Le mot de passe doit contenir entre 6 et 128 caractères")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre");

// Schéma pour le numéro de téléphone
const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9\s\-\(\)]{10,15}$/, "Format de téléphone invalide")
  .optional()
  .or(z.literal(""));

// Schéma pour l'adresse
const addressSchema = z.object({
  street: z
    .string()
    .max(100, "La rue ne peut pas dépasser 100 caractères")
    .trim()
    .optional(),
  city: z
    .string()
    .max(50, "La ville ne peut pas dépasser 50 caractères")
    .trim()
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "La ville ne peut contenir que des lettres, espaces, tirets et apostrophes")
    .optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Le code postal doit contenir exactement 5 chiffres")
    .optional(),
  country: z
    .string()
    .max(50, "Le pays ne peut pas dépasser 50 caractères")
    .trim()
    .optional()
}).optional();

// Schéma pour les préférences
const preferencesSchema = z.object({
  emailNotifications: z
    .boolean()
    .optional(),
  smsNotifications: z
    .boolean()
    .optional(),
  language: z
    .enum(['fr', 'en', 'es'], { message: "La langue doit être fr, en ou es" })
    .optional(),
  theme: z
    .enum(['light', 'dark'], { message: "Le thème doit être light ou dark" })
    .optional()
}).optional();

// === SCHÉMAS POUR L'INSCRIPTION ===
export const userRegisterSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est obligatoire"),
  phoneNumber: phoneSchema
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
  }
);

// === SCHÉMAS POUR LA CONNEXION ===
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est obligatoire")
});

// === SCHÉMAS POUR LA CRÉATION PAR ADMIN ===
export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est obligatoire"),
  role: z
    .enum(['user', 'admin', 'superAdmin'], { message: "Le rôle doit être user, admin ou superAdmin" })
    .optional()
    .default('user'),
  isVerified: z
    .boolean()
    .optional()
    .default(false)
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
  }
);

// === SCHÉMAS POUR LA MISE À JOUR PROFIL ===
export const userUpdateProfileSchema = z.object({
  name: nameSchema.optional(),
  phoneNumber: phoneSchema,
  profileImage: z
    .string()
    .url("L'URL de l'image de profil doit être valide")
    .optional()
    .or(z.literal("")),
  address: addressSchema,
  preferences: preferencesSchema
});

// === SCHÉMAS POUR LA MISE À JOUR ADMIN ===
export const adminUpdateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: z
    .enum(['user', 'admin', 'superAdmin'], { message: "Le rôle doit être user, admin ou superAdmin" })
    .optional(),
  isVerified: z
    .boolean()
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  notes: z
    .string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères")
    .trim()
    .optional(),
  lockUntil: z
    .string()
    .datetime("La date de verrouillage doit être au format ISO8601 valide")
    .optional(),
  resetLoginAttempts: z
    .boolean()
    .optional()
});

// === SCHÉMAS POUR LE CHANGEMENT DE MOT DE PASSE ===
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est obligatoire"),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, "La confirmation du nouveau mot de passe est obligatoire")
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmNewPassword"]
  }
);

// === SCHÉMAS POUR LA RÉINITIALISATION DE MOT DE PASSE ===
export const resetPasswordSchema = z.object({
  email: emailSchema
});

export const confirmResetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, "La confirmation du nouveau mot de passe est obligatoire")
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmNewPassword"]
  }
);

// === SCHÉMAS POUR LA RÉINITIALISATION ADMIN ===
export const adminResetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, "La confirmation du nouveau mot de passe est obligatoire")
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmNewPassword"]
  }
);

// === SCHÉMAS POUR LA RECHERCHE ===
export const userSearchSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom doit contenir entre 1 et 50 caractères")
    .max(50, "Le nom doit contenir entre 1 et 50 caractères")
    .trim()
    .optional(),
  email: emailSchema.optional(),
  role: z
    .enum(['user', 'admin', 'superAdmin'], { message: "Le rôle doit être user, admin ou superAdmin" })
    .optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  startDate: z
    .string()
    .datetime("La date de début doit être au format ISO8601 valide")
    .optional(),
  endDate: z
    .string()
    .datetime("La date de fin doit être au format ISO8601 valide")
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

// === SCHÉMAS POUR LA PAGINATION ===
export const userPaginationSchema = z.object({
  page: z
    .coerce
    .number()
    .int("Le numéro de page doit être un entier positif")
    .min(1, "Le numéro de page doit être un entier positif")
    .optional()
    .default(1),
  limit: z
    .coerce
    .number()
    .int("La limite doit être un entier entre 1 et 100")
    .min(1, "La limite doit être un entier entre 1 et 100")
    .max(100, "La limite doit être un entier entre 1 et 100")
    .optional()
    .default(10),
  sortBy: z
    .enum(['name', 'email', 'createdAt', 'lastLoginAt', 'stats.totalRentals'], 
          { message: "Le tri doit être par: name, email, createdAt, lastLoginAt ou stats.totalRentals" })
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'], { message: "L'ordre de tri doit être \"asc\" ou \"desc\"" })
    .optional()
    .default('desc')
});

// === SCHÉMAS POUR LES FAVORIS ===
export const manageFavoritesSchema = z.object({
  bookId: z
    .string()
    .min(1, "L'ID du livre est obligatoire")
    .regex(/^[0-9a-fA-F]{24}$/, "L'ID du livre doit être un ObjectId MongoDB valide")
});

