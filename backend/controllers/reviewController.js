import Review from "../models/reviewModel.js";
import Book from "../models/bookModel.js";

// ✅ Ajouter un avis (Review) sur un livre
export const addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user._id; 

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

// Récupérer les avis d’un livre
export const getReviewsForBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ book: bookId })
      .populate("user", "name") 
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier un avis existant
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    console.log(" Requête de mise à jour :", {
      reviewId,
      userId,
      rating,
      comment,
    });

    // Vérifie si l'avis existe
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    // Vérifie que l'utilisateur est bien l'auteur de l'avis
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé à modifier cet avis" });
    }

    // Vérifie les données
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être un nombre entre 1 et 5." });
    }

    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
    }

    // Mise à jour des champs
    review.rating = rating;
    review.comment = comment.trim();

    await review.save();

    res.status(200).json({ message: "Avis mis à jour avec succès", review });
  } catch (error) {
    console.error(" Erreur lors de la mise à jour de l'avis :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// Supprimer une review 
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    // Autoriser seulement l’auteur du commentaire
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé à supprimer cet avis" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ user: userId }).populate("book");
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Erreur lors du chargement des avis de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur lors du chargement des avis." });
  }
};