
import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est obligatoire")
    .max(200, "Le titre doit contenir entre 1 et 200 caractères")
    .trim(),
    
  author: z
    .string()
    .min(1, "L'auteur est obligatoire")
    .max(100, "Le nom de l'auteur doit contenir entre 1 et 100 caractères")
    .trim(),
    
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .trim()
    .optional()
    .or(z.literal("")),
    
  genre: z
    .string()
    .min(1, "Le genre est obligatoire")
    .max(50, "Le genre doit contenir entre 1 et 50 caractères")
    .trim(),
    
  publishedYear: z
    .coerce
    .number()
    .int("L'année doit être un nombre entier")
    .min(1000, `L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`)
    .max(new Date().getFullYear(), `L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`)
    .optional(),
    
  price: z
    .coerce
    .number()
    .min(0, "Le prix doit être un nombre positif"),
    
  availableCopies: z
    .coerce
    .number()
    .int("Le nombre de copies doit être un entier")
    .min(0, "Le nombre de copies disponibles doit être un entier positif ou nul")
    .optional(),
    
  coverImage: z
    .string()
    .url("L'URL de l'image de couverture doit être valide")
    .optional()
    .or(z.literal("")),
});

export const bookUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre doit contenir entre 1 et 200 caractères")
    .max(200, "Le titre doit contenir entre 1 et 200 caractères")
    .trim()
    .optional(),
    
  author: z
    .string()
    .min(1, "Le nom de l'auteur doit contenir entre 1 et 100 caractères")
    .max(100, "Le nom de l'auteur doit contenir entre 1 et 100 caractères")
    .trim()
    .optional(),
    
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .trim()
    .optional(),
    
  genre: z
    .string()
    .min(1, "Le genre doit contenir entre 1 et 50 caractères")
    .max(50, "Le genre doit contenir entre 1 et 50 caractères")
    .trim()
    .optional(),
    
  publishedYear: z
    .coerce
    .number()
    .int("L'année doit être un nombre entier")
    .min(1000, `L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`)
    .max(new Date().getFullYear(), `L'année de publication doit être entre 1000 et ${new Date().getFullYear()}`)
    .optional(),
    
  price: z
    .coerce
    .number()
    .min(0, "Le prix doit être un nombre positif")
    .optional(),
    
  availableCopies: z
    .coerce
    .number()
    .int("Le nombre de copies doit être un entier")
    .min(0, "Le nombre de copies disponibles doit être un entier positif ou nul")
    .optional(),
    
  coverImage: z
    .string()
    .url("L'URL de l'image de couverture doit être valide")
    .optional()
    .or(z.literal("")),
});

