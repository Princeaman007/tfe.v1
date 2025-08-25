import User from "../models/userModel.js";
import Book from "../models/bookModel.js";

//  Ajouter/Retirer un livre des favoris
export const toggleFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le livre existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Initialiser le tableau des favoris s'il n'existe pas
    if (!user.favorites) {
      user.favorites = [];
    }

    const isFavorite = user.favorites.includes(bookId);

    if (isFavorite) {
      
      user.favorites = user.favorites.filter(id => id.toString() !== bookId);
    } else {
      
      user.favorites.push(bookId);
    }

    await user.save();

    res.status(200).json({
      message: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      isFavorite: !isFavorite,
      favoritesCount: user.favorites.length
    });
  } catch (error) {
    console.error(" Erreur toggleFavorite:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

//  Récupérer les livres favoris de l'utilisateur
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      select: 'title author genre coverImage price description publishedYear likes'
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      favorites: user.favorites || [],
      count: user.favorites?.length || 0
    });
  } catch (error) {
    console.error(" Erreur getUserFavorites:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Vérifier si un livre est dans les favoris
export const checkFavoriteStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isFavorite = user.favorites?.includes(bookId) || false;

    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error(" Erreur checkFavoriteStatus:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};