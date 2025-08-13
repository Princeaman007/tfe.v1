// backend/controllers/rentalController.js - Complet
import Rental from "../models/rentalModel.js";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

// ✅ Emprunter un livre (avec dueDate de 30 jours)
// ✅ Emprunter un livre (VERSION DEBUG COMPLÈTE)
export const borrowBook = async (req, res) => {
  try {
    console.log("📚 === DÉBUT EMPRUNT LIVRE ===");
    console.log("📝 req.body:", req.body);
    console.log("📝 req.user:", req.user ? { id: req.user._id, name: req.user.name } : "PAS D'USER");
    
    const { bookId } = req.body;
    const userId = req.user._id;

    console.log("🔍 Recherche du livre avec ID:", bookId);

    // 1. Vérifier que le livre existe
    const book = await Book.findById(bookId);
    console.log("📖 Livre trouvé:", book ? {
      id: book._id,
      title: book.title,
      availableCopies: book.availableCopies,
      borrowedCount: book.borrowedCount
    } : "AUCUN LIVRE TROUVÉ");

    if (!book) {
      console.log("❌ Livre non trouvé avec ID:", bookId);
      return res.status(404).json({ message: "Livre non trouvé." });
    }

    // 2. Vérifier la disponibilité
    console.log("📊 Stock actuel:", book.availableCopies);
    if (book.availableCopies <= 0) {
      console.log("❌ Stock épuisé");
      return res.status(400).json({ message: "Ce livre n'est plus disponible." });
    }

    // 3. Vérifier si l'utilisateur a déjà emprunté ce livre
    console.log("🔍 Vérification location existante...");
    const existingRental = await Rental.findOne({ 
      user: userId, 
      book: bookId, 
      status: "borrowed" 
    });
    
    console.log("📋 Location existante:", existingRental ? "TROUVÉE" : "AUCUNE");
    
    if (existingRental) {
      console.log("❌ Livre déjà emprunté par cet utilisateur");
      return res.status(400).json({ message: "Vous avez déjà emprunté ce livre." });
    }

    // 4. Créer la location
    console.log("📝 Création de la location...");
    const borrowedAt = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowedAt.getDate() + 30);

    const rental = await Rental.create({ 
      user: userId, 
      book: bookId, 
      borrowedAt, 
      dueDate, 
      status: "borrowed" 
    });

    console.log("✅ Location créée avec succès:", {
      id: rental._id,
      user: rental.user,
      book: rental.book,
      status: rental.status
    });

    // 5. ✅ MISE À JOUR DU STOCK (PARTIE CRITIQUE)
    console.log("📊 === DÉBUT MISE À JOUR STOCK ===");
    console.log("📊 Avant modification:", {
      availableCopies: book.availableCopies,
      borrowedCount: book.borrowedCount
    });

    // Modification des valeurs
    book.availableCopies = book.availableCopies - 1;
    book.borrowedCount = (book.borrowedCount || 0) + 1;

    console.log("📊 Après modification (avant save):", {
      availableCopies: book.availableCopies,
      borrowedCount: book.borrowedCount
    });

    // Sauvegarder le livre
    console.log("💾 Sauvegarde du livre...");
    const savedBook = await book.save();
    
    console.log("✅ Livre sauvegardé:", {
      id: savedBook._id,
      title: savedBook.title,
      availableCopies: savedBook.availableCopies,
      borrowedCount: savedBook.borrowedCount
    });

    // 6. Vérification post-sauvegarde
    console.log("🔍 Vérification en base de données...");
    const bookFromDB = await Book.findById(bookId);
    console.log("📊 Livre depuis la DB:", {
      availableCopies: bookFromDB.availableCopies,
      borrowedCount: bookFromDB.borrowedCount
    });

    console.log("📊 === FIN MISE À JOUR STOCK ===");

    // 7. Réponse
    res.status(201).json({ 
      success: true,
      message: "Livre emprunté avec succès.", 
      rental,
      bookStock: {
        availableCopies: savedBook.availableCopies,
        borrowedCount: savedBook.borrowedCount,
        title: savedBook.title
      }
    });

    console.log("🎉 Emprunt réussi !");
    console.log("📚 === FIN EMPRUNT LIVRE (SUCCÈS) ===");

  } catch (error) {
    console.error("❌ === ERREUR COMPLÈTE ===");
    console.error("❌ Message:", error.message);
    console.error("❌ Stack:", error.stack);
    console.error("❌ Name:", error.name);
    
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// ✅ Retourner un livre (ancienne méthode)
export const returnBook = async (req, res) => {
  try {
    console.log("📚 === DÉBUT RETOUR LIVRE ===");
    
    const { rentalId } = req.body;
    const userId = req.user._id;

    console.log("📝 Données retour:", { rentalId, userId });

    const rental = await Rental.findById(rentalId).populate("book");
    if (!rental) {
      console.log("❌ Location non trouvée:", rentalId);
      return res.status(404).json({ message: "Location non trouvée." });
    }

    if (rental.user.toString() !== userId.toString()) {
      console.log("❌ Utilisateur non autorisé");
      return res.status(403).json({ message: "Non autorisé à retourner ce livre." });
    }

    if (rental.status === "returned") {
      console.log("❌ Livre déjà retourné");
      return res.status(400).json({ message: "Ce livre a déjà été retourné." });
    }

    console.log("📖 Retour du livre:", rental.book.title);

    // 1. Mettre à jour la location
    rental.status = "returned";
    rental.returnedAt = new Date();
    await rental.save();

    console.log("✅ Location mise à jour");

    // 2. ✅ REMETTRE LE LIVRE EN STOCK ET INCRÉMENTER returnedCount
    const book = await Book.findById(rental.book._id);
    if (book) {
      // Méthode 1: Avec save() (votre méthode actuelle améliorée)
      book.availableCopies += 1;
      book.returnedCount = (book.returnedCount || 0) + 1;  // ✅ AJOUT IMPORTANT
      await book.save();

      /* 
      // Méthode 2: Avec findByIdAndUpdate (plus atomique)
      const updatedBook = await Book.findByIdAndUpdate(
        rental.book._id,
        {
          $inc: {
            availableCopies: 1,
            returnedCount: 1
          }
        },
        { new: true }
      );
      */

      console.log("📊 Stock restauré:", {
        title: book.title,
        availableCopies: book.availableCopies,
        returnedCount: book.returnedCount,
        stockChange: "Stock incrémenté et returnedCount incrémenté"
      });
    }

    res.status(200).json({
      success: true,
      message: "Livre retourné avec succès.",
      rental: rental,
      bookStock: {
        availableCopies: book.availableCopies,
        returnedCount: book.returnedCount
      }
    });

    console.log("🎉 Retour réussi !");
    console.log("📚 === FIN RETOUR LIVRE (SUCCÈS) ===");

  } catch (error) {
    console.error("❌ returnBook:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Récupérer les locations de l'utilisateur (version simple)
export const getUserRentals = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const rentals = await Rental.find({ user: userId })
      .populate({
        path: "book",
        select: "title author genre coverImage"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    console.error("❌ getUserRentals:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getAllRentals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};

    const rentals = await Rental.find(query)
      .populate({ path: "book", select: "title author genre" })
      .populate({ path: "user", select: "name email" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.status(200).json({
      rentals,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error("❌ getAllRentals:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Récupérer les locations mensuelles (pour le graphique analytics)
export const getMonthlyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({}, "borrowedAt"); // Récupère uniquement les dates

    const monthlyCounts = {};
    rentals.forEach(r => {
      const date = new Date(r.borrowedAt);
      const month = date.toLocaleString("fr-FR", { month: "short" }).toLowerCase();
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Ordre des mois
    const months = [
      "janv.", "févr.", "mars", "avr.", "mai", "juin",
      "juil.", "août", "sept.", "oct.", "nov.", "déc."
    ];

    const result = months.map(m => ({
      mois: m,
      ventes: monthlyCounts[m] || 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Erreur getMonthlyRentals:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// ✅ Récupérer les locations d'un utilisateur spécifique (Admin)
export const getUserRentalsByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const rentals = await Rental.find({ user: userId })
      .populate({
        path: "book",
        select: "title author genre coverImage"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    console.error("❌ getUserRentalsByAdmin:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Récupérer les locations de l'utilisateur connecté avec détails
export const getUserRentalsDetailed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query; // Filtrer par statut (borrowed, returned, overdue)

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate({
        path: "book",
        select: "title author genre coverImage price description"
      })
      .populate({
        path: "user",
        select: "name email"
      })
      .sort({ createdAt: -1 });

    // Calculer les informations supplémentaires
    const rentalsWithDetails = rentals.map(rental => {
      const rentalObj = rental.toObject();
      
      // Calculer les jours restants
      const now = new Date();
      const dueDate = new Date(rental.dueDate);
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      // Statut détaillé
      let detailedStatus = rental.status;
      if (rental.status === 'borrowed' && daysRemaining < 0) {
        detailedStatus = 'overdue';
      } else if (rental.status === 'borrowed' && daysRemaining <= 3) {
        detailedStatus = 'due_soon';
      }

      return {
        ...rentalObj,
        daysRemaining,
        detailedStatus,
        canReturn: rental.status === 'borrowed',
        needsFinePaid: rental.fineAmount > 0 && !rental.finePaid
      };
    });

    res.status(200).json({
      rentals: rentalsWithDetails,
      totalCount: rentals.length,
      activeRentals: rentals.filter(r => r.status === 'borrowed').length,
      overdueRentals: rentalsWithDetails.filter(r => r.detailedStatus === 'overdue').length
    });
  } catch (error) {
    console.error("❌ getUserRentalsDetailed:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Retourner un livre avec calcul automatique des amendes
export const returnBookImproved = async (req, res) => {
  try {
    const { rentalId } = req.body;
    const userId = req.user._id;

    const rental = await Rental.findById(rentalId).populate("book");
    if (!rental) {
      return res.status(404).json({ message: "Location non trouvée." });
    }

    if (rental.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé à retourner ce livre." });
    }

    if (rental.status === "returned") {
      return res.status(400).json({ message: "Ce livre a déjà été retourné." });
    }

    const now = new Date();
    const dueDate = new Date(rental.dueDate);
    let fineAmount = 0;
    let message = "Livre retourné avec succès.";

    // Calcul des amendes si en retard
    if (now > dueDate) {
      const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * 1.5; // 1.5€ par jour de retard
      rental.fineAmount = fineAmount;
      rental.overdue = true;
      message += ` Vous avez ${daysLate} jour(s) de retard. Amende : ${fineAmount}€`;
    }

    rental.status = "returned";
    rental.returnedAt = now;
    await rental.save();

    // Remettre le livre en stock
    const book = await Book.findById(rental.book._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.status(200).json({
      message,
      rental: rental,
      fineAmount,
      bookReturned: true
    });
  } catch (error) {
    console.error("❌ returnBookImproved:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Fonction pour vérifier les locations en retard (tâche planifiée)
export const checkOverdueRentals = async () => {
  try {
    const now = new Date();
    
    // Trouver toutes les locations empruntées qui sont en retard
    const overdueRentals = await Rental.find({
      status: 'borrowed',
      dueDate: { $lt: now },
      overdue: { $ne: true }
    }).populate('book user');

    console.log(`🔍 Vérification des retards: ${overdueRentals.length} locations trouvées`);

    // Marquer comme en retard et calculer les amendes
    for (const rental of overdueRentals) {
      const daysLate = Math.ceil((now - new Date(rental.dueDate)) / (1000 * 60 * 60 * 24));
      const fineAmount = daysLate * 1.5;

      rental.overdue = true;
      rental.fineAmount = fineAmount;
      await rental.save();

      console.log(`📚 ${rental.book.title} - Retard: ${daysLate} jours, Amende: ${fineAmount}€`);
    }

    return {
      overdueCount: overdueRentals.length,
      totalFines: overdueRentals.reduce((sum, rental) => sum + rental.fineAmount, 0)
    };
  } catch (error) {
    console.error("❌ checkOverdueRentals:", error);
    throw error;
  }
};

// ✅ Envoyer des notifications d'amendes par email
export const sendFineNotification = async () => {
  try {
    // Trouver les locations avec des amendes impayées
    const unpaidFines = await Rental.find({
      fineAmount: { $gt: 0 },
      finePaid: false,
      status: 'returned'
    }).populate('user book');

    if (unpaidFines.length === 0) {
      console.log("✅ Aucune amende impayée trouvée.");
      return;
    }

    // Configuration du transporteur email (exemple avec Gmail)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Envoyer un email pour chaque amende
    for (const rental of unpaidFines) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: rental.user.email,
        subject: 'Rappel: Amende impayée - Bibliothèque',
        html: `
          <h2>Rappel d'amende impayée</h2>
          <p>Bonjour ${rental.user.name},</p>
          <p>Vous avez une amende impayée de <strong>${rental.fineAmount}€</strong> pour le livre:</p>
          <p><strong>"${rental.book.title}"</strong> de ${rental.book.author}</p>
          <p>Merci de régler cette amende dans les plus brefs délais.</p>
          <br>
          <p>Cordialement,<br>L'équipe de la Bibliothèque</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email envoyé à ${rental.user.email} pour l'amende de ${rental.fineAmount}€`);
      } catch (emailError) {
        console.error(`❌ Erreur envoi email à ${rental.user.email}:`, emailError);
      }
    }

    console.log(`✅ Traitement terminé: ${unpaidFines.length} notifications envoyées`);
  } catch (error) {
    console.error("❌ sendFineNotification:", error);
    throw error;
  }
};