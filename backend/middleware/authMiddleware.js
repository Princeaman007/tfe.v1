import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

// 🔹 Vérification du Token (JWT)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur (sans le mot de passe)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      if (!req.user.isVerified) {
        return res.status(403).json({ message: "Veuillez vérifier votre e-mail avant d’accéder à cette ressource." });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Token invalide ou expiré." });
    }
  } else {
    res.status(401).json({ message: "Non autorisé, aucun token fourni" });
  }
};

// 🔹 Vérification du rôle d'Administrateur
export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé, privilèges insuffisants." });
  }
};

// 🔹 Vérification du rôle de Super Administrateur
export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé, seul un Super Administrateur peut effectuer cette action." });
  }
};
