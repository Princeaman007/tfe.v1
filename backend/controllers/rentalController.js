import Rental from "../models/rentalModel.js";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FINE_PER_DAY = 1.5; // 💰 Amende par jour de retard

// 🔹 Emprunter un livre
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: "Aucune copie disponible." });
    }

    const rental = new Rental({
      user: userId,
      book: bookId,
      returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await rental.save();

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ message: "Livre emprunté avec succès.", rental });

  } catch (error) {
    console.error("❌ borrowBook :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Retourner un livre
const returnBook = async (req, res) => {
  try {
    const { rentalId } = req.body;
    const userId = req.user._id;

    const rental = await Rental.findById(rentalId).populate("book");
    if (!rental) return res.status(404).json({ message: "Location non trouvée." });

    if (rental.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé à retourner ce livre." });
    }

    if (rental.status === "returned") {
      return res.status(400).json({ message: "Ce livre a déjà été retourné." });
    }

    const now = new Date();
    let message = "Livre retourné avec succès.";
    let fineAmount = 0;

    if (now > rental.returnDate) {
      rental.overdue = true;
      const daysLate = Math.ceil((now - rental.returnDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * FINE_PER_DAY;
      rental.fineAmount = fineAmount;
      message += ` Vous avez ${daysLate} jour(s) de retard. Amende : ${fineAmount}€`;
    }

    rental.status = "returned";
    rental.returnDate = now;
    await rental.save();

    const book = await Book.findById(rental.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.status(200).json({ message, rental });

  } catch (error) {
    console.error("❌ returnBook :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Voir les locations d’un utilisateur
const getUserRentals = async (req, res) => {
  try {
    const userId = req.user._id;
    const rentals = await Rental.find({ user: userId }).populate("book", "title author genre");
    res.status(200).json(rentals);
  } catch (error) {
    console.error("❌ getUserRentals :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Voir toutes les locations (admin)
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("user", "name email")
      .populate("book", "title author");
    res.status(200).json(rentals);
  } catch (error) {
    console.error("❌ getAllRentals :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Voir les locations d’un utilisateur spécifique (admin)
const getUserRentalsByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const rentals = await Rental.find({ user: userId }).populate("book", "title author");
    res.status(200).json(rentals);
  } catch (error) {
    console.error("❌ getUserRentalsByAdmin :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Vérifier et marquer les locations en retard
const checkOverdueRentals = async () => {
  try {
    const overdue = await Rental.find({ returnDate: { $lt: new Date() }, status: "borrowed" });
    for (const rental of overdue) {
      rental.overdue = true;
      await rental.save();
    }
    console.log(`✅ ${overdue.length} locations marquées comme en retard.`);
  } catch (error) {
    console.error("❌ checkOverdueRentals :", error);
  }
};

// 🔹 Envoi des emails d’amendes impayées
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendFineNotification = async () => {
  try {
    const unpaidFines = await Rental.find({ fineAmount: { $gt: 0 }, finePaid: false })
      .populate("user", "name email")
      .populate("book", "title");

    if (!unpaidFines.length) {
      console.log("✅ Aucune amende impayée à notifier.");
      return;
    }

    for (const rental of unpaidFines) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: rental.user.email,
        subject: "📢 Rappel : Amende impayée pour un livre",
        text: `Bonjour ${rental.user.name},\n\nVous avez une amende de ${rental.fineAmount}€ pour le livre "${rental.book.title}".\nMerci de la régler dès que possible ici :\n${process.env.FRONTEND_URL}/pay-fine\n\nVotre bibliothèque 📚`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`❌ Email échoué pour ${rental.user.email}:`, err);
        } else {
          console.log(`📩 Email envoyé à ${rental.user.email}:`, info.response);
        }
      });
    }

    console.log(`✅ ${unpaidFines.length} notifications envoyées.`);

  } catch (error) {
    console.error("❌ sendFineNotification :", error);
  }
};

export {
  borrowBook,
  returnBook,
  getUserRentals,
  getAllRentals,
  getUserRentalsByAdmin,
  checkOverdueRentals,
  sendFineNotification,
};
