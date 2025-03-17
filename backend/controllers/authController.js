import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "This email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();

    // ✅ Generate a verification token valid for 24h
    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // ✅ Display the token in the console for debugging
    console.log("🔗 Verification Token:", verificationToken);
    console.log(`🔗 Verification Link: http://localhost:5000/api/auth/verify-email/${verificationToken}`);

    // ✅ Verification email content
    const verificationLink = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
    const emailContent = `
      <h2>Welcome ${name}!</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${verificationLink}" style="background: green; color: white; padding: 10px; text-decoration: none;">Verify My Email</a>
      <p>This link expires in 24 hours.</p>
    `;

    // ✅ Send the email
    await sendEmail(email, "Verify Your Email", emailContent);

    return res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔹 VÉRIFICATION DE L'EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isVerified) {
      return res.redirect("http://localhost:5173/login?verified=already");
    }

    user.isVerified = true;
    await user.save();

    // ✅ Redirection vers le frontend après vérification réussie
    return res.redirect("http://localhost:5173/login?verified=success");

  } catch (error) {
    return res.redirect("http://localhost:5173/login?verified=error");
  }
};



// 🔹 CONNEXION
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    if (!user.isVerified) return res.status(403).json({ message: "Veuillez vérifier votre email avant de vous connecter." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Connexion réussie", token, user: { name: user.name, email: user.email } });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 OBTENIR LE PROFIL UTILISATEUR
export const getProfile = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 RENVOI DE L'EMAIL DE VÉRIFICATION
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    if (user.isVerified) return res.status(400).json({ message: "L'email est déjà vérifié." });

    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    const verificationLink = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
    const emailContent = `
      <h2>Vérification de votre email</h2>
      <p>Cliquez sur le bouton ci-dessous pour vérifier votre email :</p>
      <a href="${verificationLink}" style="background: green; color: white; padding: 10px; text-decoration: none;">Vérifier mon email</a>
    `;

    await sendEmail(user.email, "Vérification de votre email", emailContent);

    res.status(200).json({ message: "Un nouvel email de vérification a été envoyé." });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 MOT DE PASSE OUBLIÉ
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:5000/api/auth/reset-password/${token}`;

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

// 🔹 RÉINITIALISATION DU MOT DE PASSE
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });

  } catch (error) {
    res.status(400).json({ message: "Lien invalide ou expiré." });
  }
};
