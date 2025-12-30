import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in days
      required: true,
    },
    dailyEarning: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate plans if needed
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
