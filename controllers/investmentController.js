import Investment from "../models/Investment.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import { distributeReferralCommission } from "../utils/referralCommission.js";

export const createInvestment = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.balance < plan.totalPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    user.balance -= plan.totalPrice;
    await user.save();

    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      price: plan.totalPrice,
      duration: plan.duration,
      dailyEarning: plan.dailyEarning,
      trxId: `WALLET-${Date.now()}`,
      status: "approved",
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.duration * 86400000),
      lastEarningAt: null,
    });

    await distributeReferralCommission(user, plan.totalPrice);

    res.status(201).json({
      success: true,
      message: "Investment started successfully",
      investment,
    });
  } catch (err) {
    console.error("CREATE INVESTMENT ERROR 👉", err);
    res.status(500).json({
      message: "Failed to create investment",
      error: err.message,
    });
  }
}; // ✅ THIS WAS MISSING



export const getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate("user", "name email balance") // adjust fields if needed
      .populate("plan", "name totalPrice duration dailyEarning")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: investments.length,
      investments,
    });
  } catch (err) {
    console.error("FETCH ALL INVESTMENTS ERROR 👉", err);
    res.status(500).json({
      message: "Failed to fetch investments",
      error: err.message,
    });
  }
};




export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      investmentStats,
      activeInvestments,
    ] = await Promise.all([
      Investment.aggregate([
        {
          $group: {
            _id: null,
            totalInvestmentAmount: { $sum: "$price" },
            totalInvestments: { $sum: 1 },
          },
        },
      ]),
      Investment.countDocuments({ status: "approved" }),
    ]);

    res.status(200).json({
      success: true,
      totalInvestmentAmount:
        investmentStats[0]?.totalInvestmentAmount || 0,
      totalInvestments:
        investmentStats[0]?.totalInvestments || 0,
      activeInvestments,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD STATS ERROR 👉", err);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: err.message,
    });
  }
};
