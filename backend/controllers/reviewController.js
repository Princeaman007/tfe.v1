import Review from "../models/ReviewModel.js";
import Book from "../models/bookModel.js";

// ✅ Ajouter un avis (Review) sur un livre
export const addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user._id; // L'utilisateur connecté

    // Vérifier si le livre existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis sur ce livre
    const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (existingReview) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis sur ce livre." });
    }

    const newReview = new Review({
      user: userId,
      book: bookId,
      rating,
      comment,
    });

    await newReview.save();

    res.status(201).json({ message: "Avis ajouté avec succès", review: newReview });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Récupérer les avis d’un livre
export const getReviewsForBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ book: bookId })
      .populate("user", "name") // Récupérer le nom de l'utilisateur
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer une review (utilisateur ou admin)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    // Autoriser seulement l’auteur du commentaire (ou admin éventuellement)
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé à supprimer cet avis" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
