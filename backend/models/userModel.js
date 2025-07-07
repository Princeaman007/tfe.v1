import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], 
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);