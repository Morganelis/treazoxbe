import express from "express";
import { createPlan, getPlans, updatePlan, deletePlan } from "../controllers/planController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();

// ----- Admin Routes -----
router.post("/", authMiddleware, adminMiddleware, createPlan);
router.get("/", authMiddleware, adminMiddleware, getPlans);
router.get("/withoutlogin", getPlans);

router.put("/", authMiddleware, adminMiddleware, updatePlan);
router.delete("/", authMiddleware, adminMiddleware, deletePlan);


// ----- User Routes -----
router.get("/all", authMiddleware, getPlans); // Users can view all plans

export default router;
