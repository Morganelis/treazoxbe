export const createInvestment = async (req, res) => {
  try {
    const { planId, exchange } = req.body;
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

    // 4️⃣ Deduct balance immediately
    user.balance -= plan.totalPrice;
    await user.save();

    const startDate = new Date();
    const endDate = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    );

    // 5️⃣ Create investment (AUTO APPROVED)
    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      price: plan.totalPrice,
      duration: plan.duration,
      dailyEarning: plan.dailyEarning,
      exchange,
      trxId: `BAL-${Date.now()}`,
      status: "approved",
      startDate,
      endDate,
      lastEarningAt: null,
    });

    // 6️⃣ Distribute referral commission immediately
    await distributeReferralCommission(user, plan.totalPrice);

    res.status(201).json({
      success: true,
      message: "Investment started successfully",
      investment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create investment" });
  }
};
