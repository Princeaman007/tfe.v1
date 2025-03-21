import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    rentalDate: { type: Date, default: Date.now }, // Date de début de location
    returnDate: { 
      type: Date, 
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours après la location
    },
    status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
    overdue: { type: Boolean, default: false }, // Indique si le livre est en retard
    fineAmount: { type: Number, default: 0 }, // Amende pour retard (0 par défaut)
    finePaid: { type: Boolean, default: false } // Si l’amende a été payée
  },
  { timestamps: true }
);

export default mongoose.model("Rental", rentalSchema);
