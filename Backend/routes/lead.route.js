import { Router } from "express";
import { getLeads, getLead, createLead, updateLead, deleteLead, reorderLeads } from "../controllers/lead.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);

router.route("/").get(getLeads).post(createLead);
router.patch("/reorder", reorderLeads);
router.route("/:id").get(getLead).put(updateLead).delete(deleteLead);

export default router;
