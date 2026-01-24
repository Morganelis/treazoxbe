import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    dailyEarning: { type: Number, required: true },

    trxId: { type: String, required: true },

    status: {
      type: String,
      enum: ["approved", "completed"],
      default: "approved",
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    lastEarningAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Investment ||
  mongoose.model("Investment", InvestmentSchema);
