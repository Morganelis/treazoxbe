import express from "express";
import { getAccountHistory } from "../controllers/accountHistoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAccountHistory);

export default router;
