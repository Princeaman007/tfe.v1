import Rental from "../models/rentalModel.js";
import Book from "../models/bookModel.js";

// 🔹 Emprunter un livre (Utilisateur uniquement)
export const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    // Vérifier si le livre existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Vérifier si le livre est disponible
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: "Aucune copie disponible pour ce livre." });
    }

    // Vérifier si l'utilisateur a déjà emprunté ce livre
    const existingRental = await Rental.findOne({ user: userId, book: bookId, status: "borrowed" });
    if (existingRental) {
      return res.status(400).json({ message: "Vous avez déjà emprunté ce livre." });
    }

    // Vérifier si l'utilisateur a atteint la limite d'emprunt (max 3)
    const activeRentals = await Rental.countDocuments({ user: userId, status: "borrowed" });
    if (activeRentals >= 3) {
      return res.status(400).json({ message: "Vous ne pouvez pas emprunter plus de 3 livres à la fois." });
    }

    // Créer une location
    const rental = new Rental({
      user: userId,
      book: bookId,
    });

    await rental.save();

    // Diminuer le nombre de copies disponibles du livre
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ message: "Livre emprunté avec succès", rental });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Retourner un livre (Utilisateur uniquement)
export const returnBook = async (req, res) => {
  try {
    const { rentalId } = req.body;
    const userId = req.user._id;

    // Vérifier si la location existe
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Location non trouvée." });
    }

    // Vérifier si l'utilisateur est bien celui qui a emprunté le livre
    if (rental.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous ne pouvez pas retourner un livre que vous n'avez pas emprunté." });
    }

    // Vérifier si le livre est déjà retourné
    if (rental.status === "returned") {
      return res.status(400).json({ message: "Ce livre a déjà été retourné." });
    }

    // Mettre à jour le statut de la location
    rental.status = "returned";
    rental.returnDate = new Date();
    await rental.save();

    // Augmenter le nombre de copies disponibles du livre
    const book = await Book.findById(rental.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.status(200).json({ message: "Livre retourné avec succès", rental });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Voir les livres empruntés par un utilisateur (Utilisateur uniquement)
export const getUserRentals = async (req, res) => {
  try {
    const userId = req.user._id;
    const rentals = await Rental.find({ user: userId }).populate("book", "title author genre");
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer toutes les locations (Superadmin uniquement)
export const getAllRentals = async (req, res) => {
    try {
      const rentals = await Rental.find()
        .populate("user", "name email")
        .populate("book", "title author");
  
      res.status(200).json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };
  
  // 🔹 Récupérer les locations d'un utilisateur spécifique (Superadmin uniquement)
export const getUserRentalsByAdmin = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const rentals = await Rental.find({ user: userId })
        .populate("book", "title author");
  
      res.status(200).json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };
  