import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  exchange: { type: String, required: true },
  network: { type: String, required: true },
  address: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "rejected"], 
    default: "pending" 
  },
  netAmount: { type: Number, required: true }, // amount after fee
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Withdraw || mongoose.model("Withdraw", withdrawSchema);
