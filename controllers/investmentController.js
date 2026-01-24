import Investment from "../models/Investment.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
export const createInvestment = async (req, res) => {
  try {
    const { planId } = req.body; // ❌ exchange removed
    const userId = req.user._id;

    // 1️⃣ Fetch plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 2️⃣ Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Check balance
    if (user.balance < plan.totalPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 4️⃣ Deduct balance
    user.balance -= plan.totalPrice;
    await user.save();

    const startDate = new Date();
    const endDate = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    );

    // 5️⃣ Create investment (AUTO START)
    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      price: plan.totalPrice,
      duration: plan.duration,
      dailyEarning: plan.dailyEarning,
      trxId: `WALLET-${Date.now()}`, // 🔥 internal wallet trx
      status: "approved",
      startDate,
      endDate,
      lastEarningAt: null,
    });

    // 6️⃣ Distribute referral commission
    await distributeReferralCommission(user, plan.totalPrice);

    res.status(201).json({
      success: true,
      message: "Investment started successfully",
      investment,
    });
  } } catch (err) {
  console.error("CREATE INVESTMENT ERROR 👉", err);
  res.status(500).json({
    message: "Failed to create investment",
    error: err.message,          // 👈 add this
    stack: err.stack,            // 👈 add this (for dev)
  });
}

