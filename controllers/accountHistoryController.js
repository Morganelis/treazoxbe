import Deposit from "../models/Deposit.js";
import Withdraw from "../models/Withdraw.js";
import LuckyDraw from "../models/LuckyDraw.js";
import Investment from "../models/Investment.js";

export const getAccountHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const deposits = await Deposit.find({ user: userId }).lean();
    const withdraws = await Withdraw.find({ user: userId }).lean();
    const investments = await Investment.find({ user: userId }).lean();

    const luckyDraws = await LuckyDraw.find({
      "participants.userId": userId,
    }).lean();

    const wins = await LuckyDraw.find({
      "winners.userId": userId,
    }).lean();

    let history = [];

    // Deposits
    deposits.forEach((d) => {
      history.push({
        type: "deposit",
        amount: d.amount,
        status: d.status,
        description: "Deposit submitted",
        createdAt: d.createdAt,
      });
    });

    // Withdraws
    withdraws.forEach((w) => {
      history.push({
        type: "withdraw",
        amount: w.amount,
        status: w.status,
        description: "Withdraw request",
        createdAt: w.createdAt,
      });
    });

    // Investments
    investments.forEach((i) => {
      history.push({
        type: "investment",
        amount: i.amount,
        status: i.status,
        description: "Investment created",
        createdAt: i.createdAt,
      });
    });

    // Lucky draw join (payment)
    luckyDraws.forEach((d) => {
      history.push({
        type: "luckydraw_join",
        amount: d.buyPrice,
        status: "paid",
        description: "Lucky draw participation",
        createdAt: d.createdAt,
      });
    });

    // Lucky draw wins
    wins.forEach((d) => {
      const win = d.winners.find(
        (w) => w.userId.toString() === userId.toString()
      );

      if (win) {
        history.push({
          type: "luckydraw_win",
          amount: win.wonAmount,
          status: "won",
          description: "Lucky draw winning",
          createdAt: d.updatedAt,
        });
      }
    });

    // Sort by latest
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
