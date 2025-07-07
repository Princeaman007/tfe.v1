import express from "express";
import { 
  deleteUser, 
  getAllUsers, 
  updateProfile, 
  changePassword
} from "../controllers/userController.js";
import { protect, isSuperAdmin, isVerified } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", protect, isSuperAdmin, getAllUsers);


router.put("/update-profile", protect, isVerified, updateProfile);


router.put("/change-password", protect, isVerified, changePassword);


router.delete("/:id", protect, isSuperAdmin, deleteUser);

export default router;
