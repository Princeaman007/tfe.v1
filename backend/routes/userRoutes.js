import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // ✅ Vérification et création du dossier `uploads/`
import { 
  deleteUser, 
  getAllUsers, 
  updateProfile, 
  changePassword,
  updateProfilePicture
} from "../controllers/userController.js";
import { protect, isSuperAdmin, isVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📌 **Créer `uploads/` si le dossier n'existe pas**
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📂 Dossier `uploads/` créé automatiquement.");
}

// 📌 **Configuration `Multer` pour l’upload des images**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    if (!req.user) {
      return cb(new Error("❌ L'utilisateur n'est pas authentifié."));
    }
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(new Error("❌ Seuls les fichiers JPEG, JPG et PNG sont autorisés !"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Taille max : 5MB
  fileFilter,
});

// ✅ **Route pour uploader une photo de profil**
router.post("/upload-profile-picture", protect, (req, res, next) => {
  upload.single("profilePicture")(req, res, (err) => {
    if (err) {
      console.error("🔴 Erreur Multer :", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateProfilePicture);

// ✅ **Récupérer tous les utilisateurs (Superadmin uniquement)**
router.get("/", protect, isSuperAdmin, getAllUsers);

// ✅ **Mettre à jour le profil utilisateur (Utilisateur connecté et email vérifié)**
router.put("/update-profile", protect, isVerified, updateProfile);

// ✅ **Changer le mot de passe (Utilisateur connecté et email vérifié)**
router.put("/change-password", protect, isVerified, changePassword);

// ✅ **Supprimer un utilisateur (Superadmin uniquement)**
router.delete("/:id", protect, isSuperAdmin, deleteUser);

export default router;
