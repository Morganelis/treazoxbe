import User from "../models/User.js";

export const distributeReferralCommission = async (buyer, amount) => {
  // LEVEL 1 – 8%
 if (!buyer.referredBy) return;
  const level1 = await User.findOne({ referralCode: buyer.referredBy });
  if (!level1) return;

  const lvl1Amount = amount * 0.08; // 🔹 8%
  level1.balance += lvl1Amount;            // usable balance
  level1.commissionBalance += lvl1Amount;  // display only
  await level1.save();

  // LEVEL 2 – 4%
  if (!level1.referredBy) return;

  const level2 = await User.findOne({ referralCode: level1.referredBy });
  if (!level2) return;

  const lvl2Amount = amount * 0.04;
  level2.balance += lvl2Amount;
  level2.commissionBalance += lvl2Amount;
  await level2.save();

  // LEVEL 3 – 1%
  if (!level2.referredBy) return;

  const level3 = await User.findOne({ referralCode: level2.referredBy });
  if (!level3) return;

  const lvl3Amount = amount * 0.01;
  level3.balance += lvl3Amount;
  level3.commissionBalance += lvl3Amount;
  await level3.save();
};
