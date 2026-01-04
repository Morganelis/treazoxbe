import express from "express";
import { signup, login, updateBalance,getMe ,  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword, getTeam,getMyActiveInvestments} from "../controllers/userController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/admin", authMiddleware, adminMiddleware, getAllUsers);
router.post("/admin", authMiddleware, adminMiddleware, createUser);
router.put("/admin/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteUser);
router.put("/admin/:id/password", authMiddleware, adminMiddleware, changeUserPassword);
router.get("/me", authMiddleware, getMe);
router.get("/myinvestments", authMiddleware, getMyActiveInvestments);
router.get("/team", authMiddleware, getTeam);
router.post("/balance", authMiddleware, updateBalance);
router.get("/admin-only", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;
