import Investment from "../models/Investment.js";
import User from "../models/User.js";
import { distributeReferralCommission } from "../utils/referralCommission.js";
import { distributeDailyEarningCommission } from "../utils/dailyEarningCommission.js";

export const runDailyEarnings = async (req, res) => {
  try {
    console.log("🔥 Daily earnings cron started", new Date());

    const now = new Date();

    const investments = await Investment.find({
      status: "approved",
      duration: { $gt: 0 },
    });

    console.log("📊 Active investments:", investments.length);

    for (const inv of investments) {
      if (inv.lastEarningAt) {
        const diffHours =
          (now - new Date(inv.lastEarningAt)) / (1000 * 60 * 60);

        if (diffHours < 24) continue;
      }

      const user = await User.findById(inv.user);
      if (!user) continue;

      user.balance += inv.dailyEarning;
      await user.save();

      await distributeDailyEarningCommission(user, inv.dailyEarning);

      inv.duration -= 1;
      inv.lastEarningAt = now;

      if (inv.duration === 0) {
        inv.status = "completed";
      }

      await inv.save();
    }

    console.log("✅ Daily earnings completed");

    res.json({ success: true, message: "Daily earnings processed" });
  } catch (error) {
    console.error("❌ Daily earning failed:", error);
    res.status(500).json({ success: false });
  }
};







// https://treazoxbackend.vercel.app/api/cron/daily-earnings