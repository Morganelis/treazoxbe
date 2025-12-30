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
