import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

// Fonction pour générer un token JWT (24h au lieu d'1h)
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// Fonction pour générer un Refresh Token (7 jours)
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, isVerified: false });

    await user.save();

    // Vérification que BACKEND_URL est bien défini
    if (!process.env.BACKEND_URL) {
      console.error("BACKEND_URL non défini dans .env !");
      return res.status(500).json({ message: "Erreur serveur, BACKEND_URL manquant." });
    }

    // Génération du token de vérification
    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

    console.log(`Lien de vérification envoyé : ${verificationLink}`);

    // Contenu de l'email
    const emailContent = `
      <h2>Bienvenue ${name}!</h2>
      <p>Cliquez sur le bouton ci-dessous pour vérifier votre email :</p>
      <a href="${verificationLink}" style="background: green; color: white; padding: 10px;">Vérifier mon email</a>
      <p>Ce lien expirera dans 24 heures.</p>
    `;

    await sendEmail(email, "Vérification de votre email", emailContent);

    return res.status(201).json({ message: "Inscription réussie ! Vérifiez votre email pour l'activer." });
  } catch (error) {
    console.error("Erreur serveur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token manquant." });
    }

    // Vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(400).json({ message: "Token invalide." });
    }

    // Récupération de l'utilisateur
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérification si l'utilisateur est déjà validé
    if (user.isVerified) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=already`);
    }

    // Mise à jour du statut de vérification
    user.isVerified = true;
    await user.save();

    console.log(`Email vérifié pour l'utilisateur: ${user.email}`);

    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=success`);
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email :", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=error`);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("name email role password isVerified");

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    if (!user.isVerified) return res.status(403).json({ message: "Veuillez vérifier votre email avant de vous connecter." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect." });

    // MODIFIÉ: Token avec durée de 24h
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Stocker le token dans un cookie sécurisé (pour la sécurité)
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax"
    });

    console.log("Cookie envoyé :", token);
    console.log("[Backend] - Utilisateur trouvé :", user);

    // Renvoyer le token dans la réponse JSON également
    res.status(200).json({ 
      message: "Connexion réussie",
      token: token,
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role
      } 
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// NOUVEAU: Fonction pour rafraîchir le token
export const refreshToken = async (req, res) => {
  try {
    console.log("Demande de rafraîchissement token pour utilisateur:", req.user.id);
    
    // L'utilisateur est déjà vérifié par le middleware protect
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier si l'utilisateur est toujours actif
    if (user.status === 'suspended' || user.status === 'deleted') {
      return res.status(401).json({
        success: false,
        message: 'Compte utilisateur suspendu'
      });
    }

    // Générer un nouveau token avec une durée de 24h
    const newToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );

    console.log("Nouveau token généré pour:", user.email);

    res.json({ 
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      message: 'Token rafraîchi avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors du rafraîchissement' 
    });
  }
};

// Récupérer le profil utilisateur
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclure le mot de passe

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Déconnexion (Logout)
export const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Déconnexion réussie" });
};

export const verifyToken = async (req, res) => {
  try {
    console.log("Vérification du token - utilisateur détecté :", req.cookies.token);

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Non autorisé, aucun token fourni" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération de l'utilisateur complet
    const user = await User.findById(decoded.id).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur vérifié :", user);
    res.status(200).json({ user }); // Renvoie l'utilisateur complet

  } catch (error) {
    console.error("Erreur de vérification du token :", error);
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, notifyUser = true } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    // Optionnel: Envoyer email de notification
    if (notifyUser) {
      // Code d'envoi d'email...
    }

    res.status(200).json({ 
      message: 'Mot de passe réinitialisé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la réinitialisation du mot de passe' 
    });
  }
};

// Mot de passe oublié
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const emailContent = `
      <h2>Réinitialisation de votre mot de passe</h2>
      <p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetLink}" style="background: blue; color: white; padding: 10px;">Réinitialiser mon mot de passe</a>
    `;

    await sendEmail(user.email, "Réinitialisation du mot de passe", emailContent);

    res.status(200).json({ message: "Un email de réinitialisation a été envoyé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    // Lire les mêmes champs que la validation
    const { newPassword, confirmNewPassword } = req.body;

    console.log('Tentative de reset password avec token:', token.substring(0, 20) + '...');
    console.log('Données reçues:', { 
      newPassword: newPassword ? '***' : 'undefined',
      confirmNewPassword: confirmNewPassword ? '***' : 'undefined'
    });

    // Vérifier que les champs requis sont présents
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ 
        message: "Tous les champs sont obligatoires." 
      });
    }

    // Vérifier le token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token valide pour user ID:', decoded.id);
    } catch (jwtError) {
      console.log('Erreur JWT:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(400).json({ 
          message: "Le lien de réinitialisation a expiré. Demandez un nouveau lien." 
        });
      }
      return res.status(400).json({ 
        message: "Lien de réinitialisation invalide." 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Utilisateur non trouvé pour ID:', decoded.id);
      return res.status(404).json({ 
        message: "Utilisateur non trouvé." 
      });
    }

    console.log('Utilisateur trouvé:', user.email);

    // Hasher et sauvegarder le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    console.log('Mot de passe réinitialisé pour:', user.email);

    res.status(200).json({ 
      success: true,
      message: "Mot de passe réinitialisé avec succès !" 
    });

  } catch (error) {
    console.error('Erreur dans resetPassword:', error);
    res.status(500).json({ 
      message: "Erreur serveur lors de la réinitialisation.",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};