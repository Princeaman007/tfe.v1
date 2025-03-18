import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; // ✅ Gestion des cookies
import helmet from "helmet"; // ✅ Sécurisation des entêtes HTTP
import connectDB from "./config/database.js"; // ✅ Connexion à MongoDB
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config(); // ✅ Chargement des variables d’environnement
connectDB(); // ✅ Connexion à MongoDB

const app = express();

// ✅ Middleware pour gérer JSON et les cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Sécurisation des entêtes HTTP
app.use(helmet());

// ✅ Configuration de CORS avec plusieurs origines autorisées
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ CORS: L'origine ${origin} est bloquée.`);
        callback(new Error("CORS: Requête non autorisée"));
      }
    },
    credentials: true, // ✅ Permet d'envoyer et recevoir des cookies sécurisés
    optionsSuccessStatus: 200, // ✅ Corrige certains problèmes CORS avec les navigateurs
  })
);

// ✅ Routes API
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);

// ✅ Route de test pour vérifier si le serveur fonctionne
app.get("/", (req, res) => {
  res.send("🚀 API de la Bibliothèque en ligne fonctionne !");
});

// ✅ Route `/health` pour tester si le serveur répond correctement
app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Serveur en bonne santé 🚀" });
});

// ✅ Middleware pour gérer les erreurs globales
app.use((err, req, res, next) => {
  console.error("🔥 Erreur serveur :", err);
  res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// ✅ Démarrage du Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
