import { Lead, LEAD_STATUSES } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { crud } from "../utils/crud.js";

export const { list: getLeads, get: getLead, create: createLead, update: updateLead, remove: deleteLead } = crud(Lead, {
    key: "lead",
    filters: ["status", "priority", "source"],
    search: ["name", "email", "company"],
    sort: { order: 1, createdAt: -1 },
});

// PATCH /leads/reorder  { updates: [{ id, status, order }] }
export const reorderLeads = asyncHandler(async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates)) throw new ApiError(400, "updates must be an array");

    const ops = updates.map(({ id, status, order }) => {
        if (!LEAD_STATUSES.includes(status)) throw new ApiError(400, `Invalid status: ${status}`);
        return {
            updateOne: {
                filter: { _id: id, owner: req.user._id },
                update: { $set: { status, order: Number(order) || 0 } },
            },
        };
    });

    if (ops.length) await Lead.bulkWrite(ops);
    res.json({ success: true, message: "Pipeline updated" });
});
