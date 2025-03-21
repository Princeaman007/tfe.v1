import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  payFine
} from '../controllers/paymentController.js'; // ✅ Import correct

import { protect } from "../middleware/authMiddleware.js";
import { verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// ✅ Middleware pour parser les requêtes JSON normales
router.use(express.json());

// ✅ Route pour créer une session Stripe Checkout
router.post("/create-checkout-session", protect, createCheckoutSession);

// ✅ Route pour payer une amende (protégée)
router.post('/pay-fine', protect, payFine);

// ✅ Webhook Stripe (en RAW, pas de express.json())
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post("/verify-payment", verifyPayment);


// ✅ Export du routeur
export default router;
