import Book from "../models/bookModel.js";

// ✅ Ajouter un livre (PROTÉGÉ - Admin uniquement)
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
      price, // 🔹 Ajout du prix
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Modifier un livre (PROTÉGÉ - Admin uniquement)
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
    book.price = price !== undefined ? price : book.price; // 🔹 Mise à jour du prix

    await book.save();
    res.status(200).json({ message: "Livre mis à jour avec succès", book });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Supprimer un livre (PROTÉGÉ - Admin uniquement)
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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

    // 🔍 Recherche avancée (titre, auteur, description)
    if (search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 📂 Filtrage par genre avec recherche partielle
    if (genre.trim() !== "") {
      query.genre = { $regex: genre, $options: "i" };
    }

    // 💰 Tri par prix
    let sortOption = {};
    if (sortByPrice === "asc") {
      sortOption.price = 1;
    } else if (sortByPrice === "desc") {
      sortOption.price = -1;
    }

    // 📄 Récupération des livres avec pagination et tri
    const books = await Book.find(query)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const totalBooks = await Book.countDocuments(query);

    res.status(200).json({
      books,
      total: totalBooks,
      page: currentPage,
      totalPages: Math.ceil(totalBooks / perPage), // ✅ Correction ici
    });
  } catch (error) {
    console.error("❌ Erreur getAllBooks:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// ✅ Récupérer un livre par ID (Accessible à tous)
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

// ✅ Récupérer tous les livres avec uniquement leur stock disponible
export const getBooksStock = async (req, res) => {
  try {
    const books = await Book.find().select("title availableCopies");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const toggleLikeBook = async (req, res) => {
  try {
    const { id } = req.params; // ID du livre
    const userId = req.user._id; // ID de l'utilisateur connecté

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

