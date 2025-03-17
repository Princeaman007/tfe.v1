import Review from "../models/reviewModel.js";
import Book from "../models/bookModel.js";

// 🔹 Ajouter un avis (Utilisateur uniquement)
export const addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user._id;

    // Vérifier si le livre existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (existingReview) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis sur ce livre." });
    }

    // Créer un nouvel avis
    const review = new Review({ user: userId, book: bookId, rating, comment });
    await review.save();

    res.status(201).json({ message: "Avis ajouté avec succès", review });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer les avis d'un livre
export const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ book: bookId }).populate("user", "name");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Liker / Unliker un livre
export const toggleLikeBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    const isLiked = book.likes.includes(userId);

    if (isLiked) {
      book.likes = book.likes.filter(id => id.toString() !== userId.toString());
      await book.save();
      return res.status(200).json({ message: "Like retiré", likes: book.likes.length });
    } else {
      book.likes.push(userId);
      await book.save();
      return res.status(200).json({ message: "Livre liké", likes: book.likes.length });
    }

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Calculer la note moyenne d'un livre
export const getBookRating = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ book: bookId });

    if (reviews.length === 0) {
      return res.status(200).json({ averageRating: 0, totalReviews: 0 });
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    res.status(200).json({ averageRating, totalReviews: reviews.length });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
