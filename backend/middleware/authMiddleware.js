import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    console.log("🟢 Cookies reçus :", req.cookies); // ✅ Vérifier les cookies reçus

    // 📌 Extraction du token depuis les cookies
    const token = req.cookies.token || req.cookies["sb-wzayhciqmeudvzppnjyx-auth-token"];

    if (!token) {
      return res.status(401).json({ message: "Non autorisé, aucun token fourni" });
    }

    try {
      // ✅ Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Récupérer l'utilisateur en excluant le mot de passe
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // 📌 Vérification si l'utilisateur a confirmé son email
      if (!req.user.isVerified) {
        return res.status(403).json({ message: "Veuillez vérifier votre e-mail avant d’accéder à cette ressource." });
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

      return res.status(401).json({ message: "Token invalide ou expiré." });
    }
  } catch (error) {
    console.error("🔴 Erreur serveur :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Vérification du rôle d'Administrateur
export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    next();
  } else {
    return res.status(403).json({ message: "Accès refusé, privilèges insuffisants." });
  }
};

// ✅ Vérification du rôle de Super Administrateur
export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    return res.status(403).json({ message: "Accès refusé, seul un Super Administrateur peut effectuer cette action." });
  }
};
