import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  payFine
} from '../controllers/paymentController.js'; 

import { protect } from "../middleware/authMiddleware.js";
import { verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();


router.use(express.json());


router.post("/create-checkout-session", protect, createCheckoutSession);


router.post('/pay-fine', protect, payFine);


router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post("/verify-payment", verifyPayment);



export default router;
