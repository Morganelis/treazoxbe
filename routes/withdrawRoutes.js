import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  createWithdraw,
  getAllWithdraws,
  updateWithdrawStatus,
  getWithdrawHistory,
  getWithdrawDashboardStats
} from "../controllers/withdrawController.js";

const router = express.Router();

// User creates withdraw
router.post("/", authMiddleware, createWithdraw);
router.get("/history", authMiddleware, getWithdrawHistory);
// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllWithdraws);
router.get("/admin/dashboard/stats", authMiddleware, adminMiddleware, getWithdrawDashboardStats);

router.put("/status", authMiddleware, adminMiddleware, updateWithdrawStatus);



export default router;
