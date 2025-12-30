import express from "express";
import {
  createLuckyDraw,
  getAllLuckyDrawsAdmin,
  deleteLuckyDraw,
  getActiveLuckyDraws,
  participateLuckyDraw,
  getLuckyDrawWinHistory
} from "../controllers/luckyDrawController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===== Admin ===== */
router.post("/", authMiddleware, adminMiddleware, createLuckyDraw);
router.get("/admin", authMiddleware, adminMiddleware, getAllLuckyDrawsAdmin);
router.delete("/:id", authMiddleware, adminMiddleware, deleteLuckyDraw);

/* ===== User ===== */
router.get("/", authMiddleware, getActiveLuckyDraws);
router.get("/wins", authMiddleware, getLuckyDrawWinHistory);
router.post("/participate/:drawId", authMiddleware, participateLuckyDraw);

export default router;
