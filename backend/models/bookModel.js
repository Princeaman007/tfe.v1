import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    genre: { type: String, required: true },
    publishedYear: { type: Number },
    coverImage: { type: String },
    price: { type: Number, required: true },
    availableCopies: { type: Number, required: true, default: 1 },

    // Statistiques ajoutées
    borrowedCount: { type: Number, default: 0 }, 
    returnedCount: { type: Number, default: 0 }, 

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
