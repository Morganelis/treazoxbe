import mongoose from "mongoose";

const luckyDrawSchema = new mongoose.Schema(
  {
    buyPrice: {
      type: Number,
      required: true,
    },
    winningPrice: {
      type: Number,
      required: true,
    },
    participantsLimit: {
      type: Number,
      required: true,
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    winners: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        wonAmount: Number,
      },
    ],

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.LuckyDraw ||
  mongoose.model("LuckyDraw", luckyDrawSchema);
