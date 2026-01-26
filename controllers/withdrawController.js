import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";

// User submits withdraw
export const createWithdraw = async (req, res) => {
  try {
    const { amount, exchange, network, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (amount > user.balance) return res.status(400).json({ message: "Insufficient balance" });

    const fee = (amount * 10) / 100; // 10% fee
    const netAmount = amount - fee;

    const withdraw = await Withdraw.create({
      user: user._id,
      amount,
      netAmount,
      exchange,
      network,
      address
    });

    // Deduct balance immediately
    user.balance -= amount;
    await user.save();

    res.status(201).json({ success: true, withdraw });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to submit withdraw" });
  }
};

// Admin: Get all withdraws
export const getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate("user", "name email");
    res.status(200).json({ success: true, withdraws });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch withdraws" });
  }
};

// Admin: Update withdraw status
export const updateWithdrawStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const withdraw = await Withdraw.findById(id).populate("user");

    if (!withdraw) return res.status(404).json({ message: "Withdraw not found" });
    const user = withdraw.user;

    // If rejected, return amount to user balance
    if (status === "rejected" && withdraw.status !== "rejected") {
      user.balance += withdraw.amount;
      await user.save();
    }

    // Update status
    withdraw.status = status;
    await withdraw.save();

    res.status(200).json({ success: true, withdraw });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update withdraw status" });
  }
};



export const getWithdrawHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const withdraws = await Withdraw.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, withdraws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





export const getWithdrawDashboardStats = async (req, res) => {
  try {
    const [
      totalWithdraw,
      pendingWithdraws,
      processingWithdraws,
      completedWithdraws,
      rejectedWithdraws,
    ] = await Promise.all([
      Withdraw.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),

      Withdraw.countDocuments({ status: "pending" }),
      Withdraw.countDocuments({ status: "processing" }),
      Withdraw.countDocuments({ status: "completed" }),
      Withdraw.countDocuments({ status: "rejected" }),
    ]);

    res.status(200).json({
      success: true,
      totalWithdrawAmount: totalWithdraw[0]?.totalAmount || 0,
      pendingWithdraws,
      processingWithdraws,
      completedWithdraws,
      rejectedWithdraws,
    });
  } catch (err) {
    console.error("WITHDRAW DASHBOARD STATS ERROR 👉", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdraw stats",
      error: err.message,
    });
  }
};
