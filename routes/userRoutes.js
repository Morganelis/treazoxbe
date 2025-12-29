import express from "express";
import { signup, login, updateBalance } from "../controllers/userController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/balance", authMiddleware, updateBalance);
router.get("/admin-only", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;
