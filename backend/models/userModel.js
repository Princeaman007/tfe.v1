import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    profilePicture: { type: String, default: "https://randomuser.me/api/portraits/men/70.jpg" }, // ✅ URL par défaut
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
