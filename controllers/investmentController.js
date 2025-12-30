import Investment from "../models/Investment.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";

// ===== User creates an investment =====
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
      status: "pending",
    });

    res.status(201).json({ success: true, investment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create investment" });
  }
};

// ===== Admin: Get all investments =====
export const getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate("user", "name email")
      .populate("plan", "totalPrice duration dailyEarning");
    res.status(200).json({ success: true, investments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch investments" });
  }
};

// ===== Admin: Approve / Reject investment =====
export const updateInvestmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // status = approved / rejected
    const investment = await Investment.findById(id);
    if (!investment) return res.status(404).json({ message: "Investment not found" });

    if (status === "approved") {
      investment.status = "approved";
      investment.startDate = new Date();
      investment.endDate = new Date(Date.now() + investment.duration * 24 * 60 * 60 * 1000);
      await investment.save();

      // Optionally: You can add daily earnings logic with a cron job / scheduler
    } else if (status === "rejected") {
      investment.status = "rejected";
      await investment.save();
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    res.status(200).json({ success: true, investment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update investment" });
  }
};
