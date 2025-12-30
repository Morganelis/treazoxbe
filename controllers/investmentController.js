import Investment from "../models/Investment.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import { distributeReferralCommission } from "../utils/referralCommission.js";

// User creates investment
export const createInvestment = async (req, res) => {
  try {
    const { planId, trxId, exchange } = req.body;
    const userId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      price: plan.totalPrice,
      duration: plan.duration,
      dailyEarning: plan.dailyEarning,
      exchange,
      trxId,
    });

    res.status(201).json({ success: true, investment });
  } catch (err) {
    res.status(500).json({ message: "Failed to create investment" });
  }
};

// Admin get all investments
export const getAllInvestments = async (req, res) => {
  const investments = await Investment.find()
    .populate("user", "fullName email referralCode")
    .populate("plan", "totalPrice duration");

  res.json({ success: true, investments });
};

// Admin approve / reject
export const updateInvestmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const investment = await Investment.findById(id);

    if (!investment)
      return res.status(404).json({ message: "Investment not found" });

    if (status === "approved") {
      investment.status = "approved";
      investment.startDate = new Date();
      investment.endDate = new Date(
        Date.now() + investment.duration * 24 * 60 * 60 * 1000
      );
      await investment.save();

      // 🔥 REFERRAL COMMISSION
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
