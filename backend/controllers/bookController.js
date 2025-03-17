import Book from "../models/bookModel.js";

// 🔹 Ajouter un livre (ADMIN uniquement)
export const addBook = async (req, res) => {
  try {
    const { title, author, description, genre, publishedYear, coverImage, availableCopies } = req.body;

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

// 🔹 Modifier un livre (ADMIN uniquement)
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Supprimer un livre (ADMIN uniquement)
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.status(200).json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Lister tous les livres (Accessible à tous)
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer tous les livres avec uniquement leur stock disponible
export const getBooksStock = async (req, res) => {
    try {
      const books = await Book.find().select("title availableCopies");
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };

// 🔹 Récupérer un livre par ID (Accessible à tous)
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


  