import Investment from "../models/Investment.js";
import User from "../models/User.js";
import { distributeReferralCommission } from "../utils/referralCommission.js";

export const runDailyEarnings = async (req, res) => {
  try {
    const now = new Date();

    // Get all active approved investments
    const investments = await Investment.find({
      status: "approved",
      duration: { $gt: 0 },
    });

    for (const inv of investments) {
    //   // Check 24 hours gap
    //   if (inv.lastEarningAt) {
    //     const diffHours =
    //       (now - new Date(inv.lastEarningAt)) / (1000 * 60 * 60);

    //     if (diffHours < 24) continue; // skip if not 24h passed
    //   }

      // Credit user
      const user = await User.findById(inv.user);
      if (!user) continue;

      user.balance += inv.dailyEarning;
      await user.save();

// ✅ Distribute referral commission from DAILY earning
       await distributeReferralCommission(user, inv.dailyEarning);
      // Update investment
      inv.duration -= 1;
      inv.lastEarningAt = now;

      // If duration finished
      if (inv.duration === 0) {
        inv.status = "completed";
      }

      await inv.save();
    }

    res.json({ success: true, message: "Daily earnings processed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Daily earning failed" });
  }
};






// https://treazoxbackend.vercel.app/api/cron/daily-earnings