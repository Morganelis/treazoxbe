import Deposit from "../models/Deposit.js";
import User from "../models/User.js";

// ----------------- USER: Submit Deposit -----------------
export const submitDeposit = async (req, res) => {
  try {
    const { amount, exchange, trxId } = req.body;
    const userId = req.user._id;

    if (!amount || !trxId || !exchange) {
      return res.status(400).json({ message: "All fields are required" });
    }
    

    const deposit = await Deposit.create({
      user: userId,
      amount,
      exchange: JSON.parse(exchange),
      trxId,
    });

    res.status(201).json({ success: true, deposit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- ADMIN: Get All Deposits -----------------
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("user", "email fullName");
    res.json({ success: true, deposits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- ADMIN: Update Deposit Status -----------------
export const updateDepositStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const deposit = await Deposit.findById(id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });

    deposit.status = status;
    await deposit.save();

    // If approved, add amount to user balance
    if (status === "approved") {
      const user = await User.findById(deposit.user);
      user.balance += deposit.amount;
      await user.save();
    }

    res.json({ success: true, deposit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const getAdminDepositStats = async (req, res) => {
  try {
    const depositStats = await Deposit.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Default values
    let totalDepositAmount = 0;
    let pendingDeposits = 0;
    let approvedDeposits = 0;
    let rejectedDeposits = 0;

    // Assign values based on status
    depositStats.forEach((item) => {
      totalDepositAmount += item.totalAmount;

      if (item._id === "pending") pendingDeposits = item.totalAmount;
      if (item._id === "approved") approvedDeposits = item.totalAmount;
      if (item._id === "rejected") rejectedDeposits = item.totalAmount;
    });

    res.status(200).json({
      success: true,
      totalDepositAmount,
      pendingDeposits,
      approvedDeposits,
      rejectedDeposits,
    });
  } catch (err) {
    console.error("DEPOSIT DASHBOARD ERROR 👉", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deposit stats",
      error: err.message,
    });
  }
};