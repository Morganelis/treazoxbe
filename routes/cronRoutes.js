import express from "express";
import { runDailyEarnings } from "../controllers/dailyEarning.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();

// This will be called by cron
router.post("/daily-earnings", runDailyEarnings);

export default router;
