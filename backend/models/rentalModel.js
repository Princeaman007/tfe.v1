import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    rentalDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
  },
  { timestamps: true }
);

export default mongoose.model("Rental", rentalSchema);
