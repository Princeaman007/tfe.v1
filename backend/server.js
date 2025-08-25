import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import helmet from "helmet"; 
import connectDB from "./config/database.js"; 
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; 
import favoriteRoutes from "./routes/favoriteRoutes.js";
import cron from "node-cron"; 
import { checkOverdueRentals } from "./controllers/rentalController.js"; 
import Stripe from "stripe";
import { sendFineNotification } from "./controllers/rentalController.js";

dotenv.config(); 
connectDB(); 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 
const app = express();

app.post("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(" Erreur Webhook Stripe :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement Stripe
  if (event.type === "checkout.session.completed") {
    console.log(" Paiement confirmé :", event.data.object);
    
  }

  res.json({ received: true });
});

// Middleware pour gérer JSON et les cookies
app.use(express.json());
app.use(cookieParser());

// Sécurisation des entêtes HTTP
app.use(helmet());


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", 
  "http://localhost:5174",
   "https://tfe-v1-front.onrender.com",
  "https://tfe-v1.onrender.com", 
  

];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS: L'origine ${origin} est bloquée.`);
        callback(new Error("CORS: Requête non autorisée"));
      }
    },
    credentials: true, 
    optionsSuccessStatus: 200, 
  })
);

// Vérification automatique des amendes impayées et envoi d'email tous les jours à 08:00
cron.schedule("0 8 * * *", async () => {
  console.log(" Vérification et envoi des emails pour les amendes impayées...");
  try {
    await sendFineNotification();
    console.log(" Envoi des emails d'amende terminé.");
  } catch (error) {
    console.error("Erreur lors de l'exécution du cron job pour les amendes :", error);
  }
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);

// ✅ Ajout propre de Stripe Checkout
app.use("/api/checkout", paymentRoutes); 
app.use("/api/payment", paymentRoutes);

// Route de test pour vérifier si le serveur fonctionne
app.get("/", (req, res) => {
  res.send(" API de la Bibliothèque en ligne fonctionne !");
});

//  Route `/health` pour tester si le serveur répond correctement
app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Serveur en bonne santé " });
});


//  Vérification automatique des livres en retard (Cron job)
cron.schedule("0 0 * * *", async () => {
  console.log(" Vérification automatique des livres en retard en cours...");
  try {
    await checkOverdueRentals();
    console.log(" Vérification des livres en retard terminée.");
  } catch (error) {
    console.error(" Erreur lors de l'exécution du cron job :", error);
  }
});

//  Middleware pour gérer les erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err);
  res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrage du Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
});
