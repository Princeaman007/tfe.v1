import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// 🔹 Supprimer un utilisateur (Superadmin uniquement)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Empêcher la suppression du Superadmin lui-même
    if (user.role === "superadmin") {
      return res.status(403).json({ message: "Vous ne pouvez pas supprimer un superadmin." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer tous les utilisateurs (Superadmin uniquement)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Mise à jour du profil utilisateur (Sans gestion de photo)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.name = name || user.name;
    await user.save();

    res.status(200).json({ message: "Profil mis à jour avec succès !", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ✅ Changer le mot de passe utilisateur
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // ✅ Vérification de l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect." });
    }

    // ✅ Hachage du nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
