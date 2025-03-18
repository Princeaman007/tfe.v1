import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

/**
 * 🔒 Middleware pour protéger les routes (utilisateur connecté requis)
 */
export const protect = async (req, res, next) => {
  try {
    console.log("🟢 Cookies reçus :", req.cookies); // ✅ Debug : Afficher les cookies reçus

    // 📌 Extraction du token (cookies ou Authorization header)
    let token = req.cookies?.token || req.cookies?.["sb-wzayhciqmeudvzppnjyx-auth-token"];

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "❌ Non autorisé, aucun token fourni." });
    }

    try {
      // ✅ Vérification du token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Récupération de l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "❌ Utilisateur non trouvé." });
      }

      next();
    } catch (error) {
      console.error("🔴 Erreur de vérification du token :", error.message);

      // 🔥 Supprimer le cookie invalide si le token est expiré
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(401).json({ message: "❌ Token invalide ou expiré." });
    }
  } catch (error) {
    console.error("🔴 Erreur serveur :", error.message);
    res.status(500).json({ message: "🔥 Erreur interne du serveur." });
  }
};

/**
 * 📌 Vérifie si l'utilisateur a confirmé son email
 */
export const isVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "❌ Non autorisé, utilisateur introuvable." });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ message: "📩 Veuillez vérifier votre e-mail avant d’accéder à cette ressource." });
  }

  next();
};

/**
 * 🔐 Vérifie si l'utilisateur est Administrateur ou Super Administrateur
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "❌ Non autorisé, utilisateur introuvable." });
  }

  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "🔒 Accès refusé, privilèges insuffisants." });
  }

  next();
};

/**
 * 🔥 Vérifie si l'utilisateur est Super Administrateur
 */
export const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "❌ Non autorisé, utilisateur introuvable." });
  }

  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "🔥 Accès refusé, seul un Super Administrateur peut effectuer cette action." });
  }

  next();
};
