import User from "../models/userModel.js";

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
