import express from "express";
import {
  submitDeposit,
  getAllDeposits,
  updateDepositStatus,
  getAdminDepositStats
} from "../controllers/depositController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// User submits deposit
router.post("/", authMiddleware, submitDeposit);

// Admin gets all deposits
router.get("/", authMiddleware, adminMiddleware, getAllDeposits);
router.get("/admin/dashboard/stats", authMiddleware, adminMiddleware, getAdminDepositStats);


// Admin updates deposit status
router.put("/:id", authMiddleware, adminMiddleware, updateDepositStatus);

export default router;
