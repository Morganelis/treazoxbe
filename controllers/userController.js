import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, phone, referralCode } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    let referredBy = null;
    if (referralCode) {
      const parent = await User.findOne({ referralCode });
      if (!parent) return res.status(400).json({ message: "Invalid referral code" });
      referredBy = referralCode;
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      referralCode: generateReferralCode(),
      referredBy,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBalance = async (req, res) => {
  try {
    const { amount, type } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (type === "credit") user.balance += amount;
    else if (type === "debit") {
      if (user.balance < amount) return res.status(400).json({ message: "Insufficient balance" });
      user.balance -= amount;
    }

    await user.save();
    res.json({ success: true, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
