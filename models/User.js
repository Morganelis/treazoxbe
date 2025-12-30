import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    phone: String,

    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null }, // referralCode of parent

    role: { type: String, enum: ["user", "admin"], default: "user" },

    balance: { type: Number, default: 0 },            // main wallet
    commissionBalance: { type: Number, default: 0 },  // referral earnings

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


// ✅ Use async function WITHOUT next()
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Compare password method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Export the model (avoid recompiling)
export default mongoose.models.User || mongoose.model("User", userSchema);
