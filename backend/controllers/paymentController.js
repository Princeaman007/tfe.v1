import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Book from "../models/bookModel.js";
import Rental from "../models/rentalModel.js";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const frontendUrl = process.env.FRONTEND_URL;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("❌ STRIPE_SECRET_KEY manquante dans les variables d'environnement.");
}
if (!frontendUrl) {
  throw new Error("❌ FRONTEND_URL manquante dans les variables d'environnement.");
}
if (!stripeWebhookSecret) {
  console.warn("⚠️ STRIPE_WEBHOOK_SECRET non défini. Le webhook Stripe risque d’échouer.");
}

const stripe = new Stripe(stripeSecretKey);

// ✅ Créer une session de paiement Stripe pour louer un livre
export const createCheckoutSession = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "ID du livre invalide ou manquant." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }

    if (!book.price || book.price <= 0) {
      return res.status(400).json({ message: "Prix du livre invalide." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: book.title,
              description: `Auteur: ${book.author}`,
            },
            unit_amount: Math.round(book.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        bookId: book._id.toString(),
      },
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ Erreur Stripe :", error);
    res.status(500).json({ message: "Erreur lors de la création du paiement.", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID manquant" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ message: "Session introuvable" });

    const existingRental = await Rental.findOne({ stripeSessionId: session.id });
    if (existingRental) {
      return res.status(200).json({
        message: "Paiement déjà vérifié",
        rental: {
          ...existingRental._doc,
          borrowedAt: existingRental.borrowedAt
            ? new Date(existingRental.borrowedAt).toISOString()
            : null,
          dueDate: existingRental.dueDate
            ? new Date(existingRental.dueDate).toISOString()
            : null,
        }
      });
    }

    const userId = session.metadata.userId;
    const bookId = session.metadata.bookId;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "Données manquantes dans la session Stripe" });
    }

    const borrowedAt = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowedAt.getDate() + 30); // 30 jours de location

    const rental = await Rental.create({
      user: userId,
      book: bookId,
      stripeSessionId: session.id,
      borrowedAt,
      dueDate,
      status: "borrowed",
    });

    res.status(201).json({
      message: "Location enregistrée",
      rental: {
        ...rental._doc,
        borrowedAt: borrowedAt.toISOString(),
        dueDate: dueDate.toISOString(),
      }
    });

  } catch (error) {
    console.error("❌ Erreur vérification paiement :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// ✅ Webhook Stripe
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).json({ message: "Signature Stripe manquante." });

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error("❌ Erreur signature webhook :", err.message);
    return res.status(400).json({ message: "Signature Stripe invalide", error: err.message });
  }

  // Gérer les événements
  switch (event.type) {
    case "checkout.session.completed":
      console.log("✅ Paiement réussi - session :", event.data.object.id);
      // Tu peux ajouter des logs ou autres traitements ici si nécessaire
      break;
    default:
      console.log(`ℹ️ Événement non géré : ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// ✅ Paiement des amendes
export const payFine = async (req, res) => {
  try {
    const { rentalId } = req.body;
    const userId = req.user._id;

    const rental = await Rental.findById(rentalId).populate("book");
    if (!rental) return res.status(404).json({ message: "Location introuvable." });

    if (rental.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé à payer cette amende." });
    }

    if (rental.finePaid) {
      return res.status(400).json({ message: "Amende déjà payée." });
    }

    if (rental.fineAmount === 0) {
      return res.status(400).json({ message: "Aucune amende à payer." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Amende - ${rental.book.title}`,
              description: "Retard de retour",
            },
            unit_amount: Math.round(rental.fineAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/fine-payment-success?rentalId=${rental._id}`,
      cancel_url: `${frontendUrl}/fine-payment-failed`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("❌ Erreur paiement amende :", error);
    res.status(500).json({ message: "Erreur lors du paiement de l’amende", error: error.message });
  }
};
