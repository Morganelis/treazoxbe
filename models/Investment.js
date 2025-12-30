import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    dailyEarning: { type: Number, required: true },
    exchange: { type: String },
    trxId: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    startDate: { type: Date }, // Set when approved
    endDate: { type: Date },   // startDate + duration
  },
  { timestamps: true }
);

export default mongoose.models.Investment || mongoose.model("Investment", InvestmentSchema);
