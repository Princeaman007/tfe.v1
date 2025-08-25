import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    stripeSessionId: { type: String }, // ID de session Stripe
    borrowedAt: { type: Date, default: Date.now },
    dueDate: { 
      type: Date, 
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    },
    returnedAt: { type: Date },
    status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
    overdue: { type: Boolean, default: false },
    fineAmount: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Rental", rentalSchema);