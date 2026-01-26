import Plan from "../models/Plan.js"

// ===== Admin Create Plan =====
export const createPlan = async (req, res) => {
  try {
    const { totalPrice, duration, dailyEarning } = req.body;
    const plan = await Plan.create({ totalPrice, duration, dailyEarning });
    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create plan" });
  }
};

// ===== Admin Get All Plans =====
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

// ===== Admin Update Plan =====
export const updatePlan = async (req, res) => {
  try {
    const { id, totalPrice, duration, dailyEarning } = req.body;
    const plan = await Plan.findByIdAndUpdate(
      id,
      { totalPrice, duration, dailyEarning },
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update plan" });
  }
};

// ===== Admin Delete Plan =====
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.body;
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete plan" });
  }
};


export const getPlanStats = async (req, res) => {
  try {
    const stats = await Plan.aggregate([
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          activePlans: {
            $sum: {
              $cond: [{ $eq: ["$isActive", true] }, 1, 0],
            },
          },
          inactivePlans: {
            $sum: {
              $cond: [{ $eq: ["$isActive", false] }, 1, 0],
            },
          },
          avgDailyEarning: { $avg: "$dailyEarning" },
          totalDailyEarning: { $sum: "$dailyEarning" },
        },
      },
    ]);

    const result = stats[0] || {
      totalPlans: 0,
      activePlans: 0,
      inactivePlans: 0,
      avgDailyEarning: 0,
      totalDailyEarning: 0,
    };

    res.status(200).json({
      success: true,
      stats: result,
    });
  } catch (error) {
    console.error("Plan Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan stats",
      error: error.message,
    });
  }
};

