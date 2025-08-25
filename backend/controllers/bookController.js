import Book from "../models/bookModel.js";
import Rental from "../models/rentalModel.js";

//  Ajouter un livre (PROTÉGÉ - Admin uniquement)
export const addBook = async (req, res) => {
  try {
    const { title, author, description, genre, publishedYear, coverImage, availableCopies, price } = req.body;

    // Vérifier que tous les champs requis sont remplis
    if (!title || !author || !description || !genre || !publishedYear || availableCopies === undefined || !price) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const newBook = new Book({
      title,
      author,
      description,
      genre,
      publishedYear,
      coverImage,
      availableCopies,
      price, 
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier un livre (PROTÉGÉ - Admin uniquement)
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, genre, publishedYear, coverImage, availableCopies, price } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.genre = genre || book.genre;
    book.publishedYear = publishedYear || book.publishedYear;
    book.coverImage = coverImage || book.coverImage;
    book.availableCopies = availableCopies !== undefined ? availableCopies : book.availableCopies;
    book.price = price !== undefined ? price : book.price; 

    await book.save();
    res.status(200).json({ message: "Livre mis à jour avec succès", book });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

//Supprimer un livre (PROTÉGÉ - Admin uniquement)
export const deleteBook = async (req, res) => {
  try {
    console.log(" === DÉBUT SUPPRESSION ===");
    console.log(" Params reçus:", req.params);
    console.log(" User:", req.user ? `${req.user.name} (${req.user.role})` : "AUCUN USER");
    
    const { id } = req.params;
    console.log(" ID à supprimer:", id);

    // Vérifier que l'ID est valide
    if (!id) {
      console.log(" ID manquant");
      return res.status(400).json({ message: "ID du livre manquant" });
    }

    console.log(" Recherche du livre...");
    const book = await Book.findById(id);
    console.log(" Livre trouvé:", book ? `"${book.title}" par ${book.author}` : "AUCUN");

    if (!book) {
      console.log(" Livre non trouvé");
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    console.log(" Suppression en cours...");
    const result = await book.deleteOne();
    console.log(" Résultat suppression:", result);

    console.log(" Suppression réussie !");
    res.status(200).json({ 
      success: true,
      message: "Livre supprimé avec succès",
      deletedBook: {
        id: book._id,
        title: book.title
      }
    });

    console.log(" === FIN SUPPRESSION (SUCCÈS) ===");

  } catch (error) {
    console.log(" === FIN SUPPRESSION (ERREUR) ===");
    console.error(" Erreur complète:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Gestion spécifique des erreurs
    if (error.name === 'CastError') {
      console.log("CastError - ID MongoDB invalide");
      return res.status(400).json({ 
        success: false,
        message: "Format d'ID invalide" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      genre = "",
      sortByPrice = ""
    } = req.query;

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);

    let query = {};

    //Recherche avancée (titre, auteur, description)
    if (search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filtrage par genre avec recherche partielle
    if (genre.trim() !== "") {
      query.genre = { $regex: genre, $options: "i" };
    }

    //Tri par prix
    let sortOption = {};
    if (sortByPrice === "asc") {
      sortOption.price = 1;
    } else if (sortByPrice === "desc") {
      sortOption.price = -1;
    }

    //Récupération des livres avec pagination et tri
    const books = await Book.find(query)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const totalBooks = await Book.countDocuments(query);

    res.status(200).json({
      books,
      total: totalBooks,
      page: currentPage,
      totalPages: Math.ceil(totalBooks / perPage), 
    });
  } catch (error) {
    console.error("Erreur getAllBooks:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// Récupérer un livre par ID 
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

//Récupérer tous les livres avec uniquement leur stock disponible
export const getBooksStock = async (req, res) => {
  try {
    const books = await Book.find().select("title availableCopies");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();

    const [copiesStats] = await Book.aggregate([
      { $group: { _id: null, totalCopies: { $sum: "$availableCopies" } } }
    ]);

    const [likesStats] = await Book.aggregate([
      {
        $project: {
          likesCount: { $size: "$likes" },
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likesCount" }
        }
      }
    ]);

    const borrowedCount = await Rental.countDocuments({ status: "borrowed" });
    const returnedCount = await Rental.countDocuments({ status: "returned" });

    res.status(200).json({
      totalBooks,
      availableCopies: copiesStats?.totalCopies || 0,
      totalLikes: likesStats?.totalLikes || 0,
      rentedBooks: borrowedCount,
      returnedBooks: returnedCount,
    });
  } catch (error) {
    console.error(" Erreur dans getBookStats:", error);
    res.status(500).json({ message: "Erreur lors des statistiques", error: error.message });
  }
};


export const getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct("genre");
    res.status(200).json({ genres });
  } catch (error) {
    console.error(" Erreur lors de la récupération des genres :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const toggleLikeBook = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user._id; 

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà liké ce livre
    const hasLiked = book.likes.includes(userId);

    if (hasLiked) {
      book.likes = book.likes.filter((like) => like.toString() !== userId.toString());
    } else {
      book.likes.push(userId);
    }

    await book.save();
    res.status(200).json({ message: "Like mis à jour", likes: book.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

