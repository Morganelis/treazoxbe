import LuckyDraw from "../models/LuckyDraw.js";
import User from "../models/User.js";

/* ================= ADMIN ================= */

// Create Lucky Draw
export const createLuckyDraw = async (req, res) => {
  try {
    const { buyPrice, winningPrice, participantsLimit, endDate } = req.body;

    const draw = await LuckyDraw.create({
      buyPrice,
      winningPrice,
      participantsLimit,
      endDate,
    });

    res.status(201).json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all lucky draws (admin)
export const getAllLuckyDrawsAdmin = async (req, res) => {
  try {
    const draws = await LuckyDraw.find()
      .populate("participants.userId", "fullName email")
      .populate("winners.userId", "fullName email");

    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Lucky Draw
export const deleteLuckyDraw = async (req, res) => {
  await LuckyDraw.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Lucky draw deleted" });
};

/* ================= USER ================= */

// Get active lucky draws
export const getActiveLuckyDraws = async (req, res) => {
  const draws = await LuckyDraw.find({
  status: "active",
  $or: [
    { endDate: { $exists: false } },   // no end date
    { endDate: { $gte: new Date() } }, // or end date is future
  ],
});
  res.json({ success: true, draws });
};

// Participate in lucky draw
export const participateLuckyDraw = async (req, res) => {
  try {
    const userId = req.user._id;
    const { drawId } = req.params;

    const draw = await LuckyDraw.findById(drawId);
    if (!draw) return res.status(404).json({ message: "Draw not found" });

    if (draw.status === "completed")
      return res.status(400).json({ message: "Draw already completed" });

    if (new Date() > draw.endDate)
      return res.status(400).json({ message: "Draw expired" });

    if (draw.participants.length >= draw.participantsLimit)
      return res.status(400).json({ message: "Draw is full" });

    const alreadyJoined = draw.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    if (alreadyJoined)
      return res.status(400).json({ message: "Already participated" });

    const user = await User.findById(userId);
    if (!user || user.balance < draw.buyPrice)
      return res.status(400).json({ message: "Insufficient balance" });

    // 💳 Deduct buy price
    user.balance -= draw.buyPrice;
    await user.save();

    // ➕ Add participant
    draw.participants.push({ userId });
    await draw.save();

    // 🎯 Auto pick winner when full
    if (draw.participants.length === draw.participantsLimit) {
      await pickWinner(draw._id);
    }

    res.json({ success: true, message: "Participation successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SYSTEM ================= */

// 🔥 PICK ONLY ONE WINNER
const pickWinner = async (drawId) => {
  try {
    const draw = await LuckyDraw.findById(drawId);
    if (!draw || draw.status === "completed") return;

    if (draw.participants.length < draw.participantsLimit) return;

    // 🎯 Random winner
    const randomIndex = Math.floor(Math.random() * draw.participants.length);
    const winnerParticipant = draw.participants[randomIndex];

    // Save winner
    draw.winners = [
      {
        userId: winnerParticipant.userId,
        wonAmount: draw.winningPrice,
      },
    ];

    // 💰 Credit winner balance
    await User.findByIdAndUpdate(winnerParticipant.userId, {
      $inc: { balance: draw.winningPrice },
    });

    draw.status = "completed";
    await draw.save();
  } catch (err) {
    console.error("Pick winner error:", err.message);
  }
};

// User win history
export const getLuckyDrawWinHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const draws = await LuckyDraw.find({
      "winners.userId": userId,
    }).sort({ updatedAt: -1 });

    const wins = [];

    draws.forEach((d) => {
      d.winners.forEach((w) => {
        if (w.userId.toString() === userId.toString()) {
          wins.push({
            drawId: d._id,
            wonAmount: w.wonAmount,
            date: d.updatedAt,
          });
        }
      });
    });

    res.json({ success: true, wins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
