import Book from "../models/bookModel.js";

// ✅ Ajouter un livre (PROTÉGÉ - Admin uniquement)
export const addBook = async (req, res) => {
  try {
    const { title, author, description, genre, publishedYear, coverImage, availableCopies } = req.body;

    // Vérifier que tous les champs requis sont remplis
    if (!title || !author || !description || !genre || !publishedYear || availableCopies === undefined) {
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
    const { title, author, description, genre, publishedYear, coverImage, availableCopies } = req.body;

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

// ✅ Lister tous les livres (Accessible à tous) avec pagination et recherche
export const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Book.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      books,
    });
  } catch (error) {
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
