import Investment from "../models/Investment.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import { distributeReferralCommission } from "../utils/referralCommission.js";

// USER CREATE INVESTMENT
// USER CREATE INVESTMENT (BUY FROM BALANCE)
export const createInvestment = async (req, res) => {
  try {
    const { planId, exchange } = req.body;
    const userId = req.user._id;

    // 1️⃣ Fetch plan
    const plan = await Plan.findById(planId);
    if (!plan)
      return res.status(404).json({ message: "Plan not found" });

    // 2️⃣ Fetch user
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // 3️⃣ Check balance
    if (user.balance < plan.totalPrice) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // 4️⃣ Deduct balance
    user.balance -= plan.totalPrice;
    await user.save();

    // 5️⃣ Create investment
    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      price: plan.totalPrice,
      duration: plan.duration,
      dailyEarning: plan.dailyEarning,
      exchange,
      trxId: `BAL-${Date.now()}`, // auto trx id
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      investment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create investment" });
  }
};


// ADMIN GET ALL
export const getAllInvestments = async (req, res) => {
  const investments = await Investment.find()
    .populate("user", "fullName email")
    .populate("plan", "totalPrice duration");

  res.json({ success: true, investments });
};

// ADMIN APPROVE / REJECT
export const updateInvestmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const investment = await Investment.findById(id);

    if (!investment)
      return res.status(404).json({ message: "Investment not found" });

    if (status === "approved") {
      investment.status = "approved";
      investment.startDate = new Date();
    investment.lastEarningAt = null;

      investment.endDate = new Date(
        Date.now() + investment.duration * 24 * 60 * 60 * 1000
      );

      await investment.save();

      const buyer = await User.findById(investment.user);
      await distributeReferralCommission(buyer, investment.price);
    }

    if (status === "rejected") {
      investment.status = "rejected";
      await investment.save();
    }

    res.json({ success: true, investment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update investment" });
  }
};
