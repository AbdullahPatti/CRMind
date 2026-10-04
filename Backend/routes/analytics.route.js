import { Router } from "express";
import { getOverview } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/overview", protect, getOverview);

export default router;
