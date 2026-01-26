import express from "express";
import {
  createInvestment,
  getAllInvestments,getAdminDashboardStats
} from "../controllers/investmentController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== User Route =====
router.post("/", authMiddleware, createInvestment); // Create investment request

// ===== Admin Routes =====
router.get("/", authMiddleware, adminMiddleware, getAllInvestments); // View all
router.get("/", authMiddleware, adminMiddleware, getAdminDashboardStats); // View all

// router.put("/status", authMiddleware, adminMiddleware, updateInvestmentStatus); // Approve / reject

export default router;
