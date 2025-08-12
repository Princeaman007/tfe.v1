import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// 🔹 Récupérer tous les utilisateurs (Admin/superAdmin)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;
    
    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    
    // Construction de la requête de recherche
    let query = {};
    
    // Recherche par nom ou email
    if (search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    // Filtrage par rôle
    if (role.trim() !== "") {
      query.role = role;
    }
    
    // Récupération des utilisateurs avec pagination
    const users = await User.find(query)
      .select("-password") // Exclure le mot de passe
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    
    const totalUsers = await User.countDocuments(query);
    
    res.status(200).json({
      users,
      total: totalUsers,
      page: currentPage,
      totalPages: Math.ceil(totalUsers / perPage),
      hasNextPage: currentPage < Math.ceil(totalUsers / perPage),
      hasPrevPage: currentPage > 1
    });
  } catch (error) {
    console.error("❌ Erreur getAllUsers:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer un utilisateur par ID (Admin/superAdmin)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Erreur getUserById:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Créer un nouvel utilisateur (Admin/superAdmin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    
    // Validation des champs requis
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nom, email et mot de passe sont requis" });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
    }
    
    // Validation du rôle
    const allowedRoles = ["user", "admin", "superAdmin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }
    
    // Vérifier les permissions pour créer des superAdmins
    if (role === "superAdmin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Seul un superAdmin peut créer un autre superAdmin" });
    }
    
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Création de l'utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true // L'utilisateur créé par un admin est automatiquement vérifié
    });
    
    await newUser.save();
    
    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findById(newUser._id).select("-password");
    
    res.status(201).json({ 
      message: "Utilisateur créé avec succès", 
      user: userResponse 
    });
  } catch (error) {
    console.error("❌ Erreur createUser:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Mettre à jour un utilisateur (Admin/superAdmin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isVerified } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Empêcher la modification du superAdmin par un admin
    if (user.role === "superAdmin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Seul un superAdmin peut modifier un autre superAdmin" });
    }
    
    // Validation du nouveau rôle si fourni
    if (role) {
      const allowedRoles = ["user", "admin", "superAdmin"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Rôle invalide" });
      }
      
      // Vérifier les permissions pour attribuer le rôle superAdmin
      if (role === "superAdmin" && req.user.role !== "superAdmin") {
        return res.status(403).json({ message: "Seul un superAdmin peut attribuer le rôle superAdmin" });
      }
    }
    
    // Vérifier si le nouvel email existe déjà (si l'email est modifié)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
      }
    }
    
    // Mise à jour des champs
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    res.status(200).json({ 
      message: "Utilisateur mis à jour avec succès", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("❌ Erreur updateUser:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Changer le mot de passe d'un utilisateur (Admin/superAdmin)
export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Empêcher la modification du mot de passe du superAdmin par un admin
    if (user.role === "superAdmin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Seul un superAdmin peut modifier le mot de passe d'un autre superAdmin" });
    }
    
    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mise à jour du mot de passe
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    
    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("❌ Erreur changeUserPassword:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Supprimer un utilisateur (superAdmin uniquement)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Empêcher la suppression d'un superAdmin
    if (user.role === "superAdmin") {
      return res.status(403).json({ message: "Impossible de supprimer un superAdmin" });
    }
    
    // Empêcher l'auto-suppression
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }
    
    await User.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur deleteUser:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Obtenir les statistiques des utilisateurs (Admin/superAdmin)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Utilisateurs créés ce mois
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: currentMonth }
    });
    
    res.status(200).json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      newUsersThisMonth,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error("❌ Erreur getUserStats:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Basculer le statut de vérification d'un utilisateur (Admin/superAdmin)
export const toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Empêcher la modification du statut d'un superAdmin par un admin
    if (user.role === "superAdmin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Seul un superAdmin peut modifier le statut d'un autre superAdmin" });
    }
    
    user.isVerified = !user.isVerified;
    await user.save();
    
    const updatedUser = await User.findById(id).select("-password");
    
    res.status(200).json({ 
      message: `Utilisateur ${user.isVerified ? 'vérifié' : 'non vérifié'} avec succès`, 
      user: updatedUser 
    });
  } catch (error) {
    console.error("❌ Erreur toggleUserVerification:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Fonctions existantes (conservées)
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

export const changePassword = async (req, res) => {
  try {
    // ✅ Utiliser les mêmes noms que la validation
    const { currentPassword, newPassword } = req.body;
    
    console.log('Changement de mot de passe pour user:', req.user.id);
    console.log('Données reçues:', { 
      currentPassword: currentPassword ? '***' : 'undefined', 
      newPassword: newPassword ? '***' : 'undefined' 
    });
    
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // ✅ Vérifier que currentPassword n'est pas undefined
    if (!currentPassword) {
      return res.status(400).json({ message: "Mot de passe actuel requis." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect." });
    }

    // ✅ Hasher le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 12); // 12 rounds recommandés
    await user.save();

    console.log('Mot de passe mis à jour avec succès pour user:', req.user.id);

    res.status(200).json({ 
      success: true,
      message: "Mot de passe mis à jour avec succès !" 
    });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ 
      message: "Erreur interne du serveur.",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};