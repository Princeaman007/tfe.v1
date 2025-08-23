import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

/**
 * 🔒 Middleware : Authentification requise
 */
export const protect = async (req, res, next) => {
  try {
    let token =
      req.cookies?.token || req.cookies?.["sb-wzayhciqmeudvzppnjyx-auth-token"];

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "❌ Non autorisé : token manquant." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "❌ Utilisateur introuvable." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔴 Erreur de token :", error.message);
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(401).json({ message: "❌ Token invalide ou expiré." });
  }
};

/**
 * 📩 Vérifie si l'utilisateur a validé son email
 */
export const isVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "❌ Non autorisé." });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      message: "📩 Merci de vérifier votre e-mail pour accéder à cette ressource.",
    });
  }

  next();
};

/**
 * 🔐 Vérifie si l'utilisateur est admin OU superAdmin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "❌ Non autorisé." });
  }

  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return res.status(403).json({
      message: "🔒 Accès refusé : rôle administrateur requis.",
    });
  }

  next();
};

/**
 * 🔥 Vérifie si l'utilisateur est superAdmin uniquement
 */
export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superAdmin") {
    return res.status(403).json({ message: "⛔️ Accès réservé au super administrateur." });
  }

  next();
};
