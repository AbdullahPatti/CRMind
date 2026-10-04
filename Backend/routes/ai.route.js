import { Router } from "express";
import { getStatus, leadSummary, generateEmail, salesInsights } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);

router.get("/status", getStatus);
router.post("/lead-summary", leadSummary);
router.post("/generate-email", generateEmail);
router.post("/sales-insights", salesInsights);

export default router;
