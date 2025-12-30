import LuckyDraw from "../models/LuckyDraw.js";
import User from "../models/User.js";

/* ================= ADMIN ================= */

// Create Lucky Draw
export const createLuckyDraw = async (req, res) => {
  try {
    const { buyPrice, winningPrice, participantsLimit, winnersCount, endDate } = req.body;

    const draw = await LuckyDraw.create({
      buyPrice,
      winningPrice,
      participantsLimit,
      winnersCount,
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
  const draws = await LuckyDraw.find({ status: "active" })
    .populate("participants.userId", "fullName")
    .populate("winners.userId", "fullName");

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
      return res.status(400).json({ message: "Draw already ended" });

    if (draw.participants.length >= draw.participantsLimit)
      return res.status(400).json({ message: "Draw is full" });

    const alreadyJoined = draw.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    if (alreadyJoined)
      return res.status(400).json({ message: "Already participated" });

    const user = await User.findById(userId);
    if (user.balance < draw.buyPrice)
      return res.status(400).json({ message: "Insufficient balance" });

    // Deduct balance
    user.balance -= draw.buyPrice;
    await user.save();

    // Add participant
    draw.participants.push({ userId });
    await draw.save();

    // Auto pick winner if full
    if (draw.participants.length === draw.participantsLimit) {
      await pickWinners(draw._id);
    }

    res.json({ success: true, message: "Participation successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SYSTEM ================= */

const pickWinners = async (drawId) => {
  const draw = await LuckyDraw.findById(drawId).populate("participants.userId");
  if (!draw) return;

  const shuffled = draw.participants.sort(() => 0.5 - Math.random());
  const winners = shuffled.slice(0, draw.winnersCount);

  const prizePerWinner = draw.winningPrice / draw.winnersCount;

  for (const w of winners) {
    draw.winners.push({
      userId: w.userId._id,
      wonAmount: prizePerWinner,
    });

    await User.findByIdAndUpdate(w.userId._id, {
      $inc: { balance: prizePerWinner },
    });
  }

  draw.status = "completed";
  await draw.save();
};
