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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Utilisateurs qui aiment ce livre
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
