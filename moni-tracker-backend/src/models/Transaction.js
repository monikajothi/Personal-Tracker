import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, default: "Other" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: 1 });

export default mongoose.model("Transaction", transactionSchema);