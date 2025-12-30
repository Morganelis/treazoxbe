import express from "express";
import { createPlan, getPlans, updatePlan, deletePlan } from "../controllers/planController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();

// ----- Admin Routes -----
router.post("/", adminMiddleware, createPlan); // Admin create
router.get("/", adminMiddleware, getPlans); // Admin view
router.put("/", adminMiddleware, updatePlan); // Admin update
router.delete("/", adminMiddleware, deletePlan); // Admin delete

// ----- User Routes -----
router.get("/all", authMiddleware, getPlans); // Users can view all plans

export default router;
