import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  createWithdraw,
  getAllWithdraws,
  updateWithdrawStatus
} from "../controllers/withdrawController.js";

const router = express.Router();

// User creates withdraw
router.post("/", authMiddleware, createWithdraw);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllWithdraws);
router.put("/status", authMiddleware, adminMiddleware, updateWithdrawStatus);

export default router;
