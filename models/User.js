import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    balance: { type: Number, default: 0 },
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
